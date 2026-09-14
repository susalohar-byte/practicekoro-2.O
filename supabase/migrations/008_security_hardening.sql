-- =============================================================
-- PRACTICEKORO: MIGRATION 008 - SECURITY & PERMISSIONS HARDENING
-- =============================================================
-- 1. Remove hardcoded/placeholder secrets from database tables
-- 2. Restrict payment_gateways column access
-- 3. Set search_path = public, pg_temp on all SECURITY DEFINER functions
-- 4. Harden payment verification invariants (amount, currency, ownership)
-- =============================================================

-- -------------------------------------------------------------
-- 1. SAFE SECRETS PURGE
-- -------------------------------------------------------------
UPDATE public.payment_gateways
SET key_secret = NULL,
    webhook_secret = NULL
WHERE key_secret LIKE 'rzp_test_sec%'
   OR webhook_secret LIKE 'whsec_%'
   OR key_secret = 'rzp_test_sec_practicekoro_2026'
   OR webhook_secret = 'whsec_practicekoro_test_2026';

-- -------------------------------------------------------------
-- 2. RESTRICT PAYMENT_GATEWAYS PERMISSIONS
-- -------------------------------------------------------------
-- Prevent regular students from reading key_secret or webhook_secret
REVOKE ALL ON TABLE public.payment_gateways FROM PUBLIC;
REVOKE ALL ON TABLE public.payment_gateways FROM anon;
REVOKE ALL ON TABLE public.payment_gateways FROM authenticated;

-- Allow authenticated users to view only public metadata (gateway name, public key_id, is_active)
GRANT SELECT (gateway, key_id, is_active) ON TABLE public.payment_gateways TO authenticated;
GRANT ALL ON TABLE public.payment_gateways TO service_role;
GRANT ALL ON TABLE public.payment_gateways TO postgres;

-- -------------------------------------------------------------
-- 3. HARDENED PAYMENT VERIFICATION FUNCTION
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_razorpay_payment(
    p_order_id TEXT,
    p_payment_id TEXT,
    p_signature TEXT,
    p_plan_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_payment RECORD;
    v_plan RECORD;
    v_secret TEXT;
    v_expected_signature TEXT;
    v_active_sub RECORD;
    v_subscription_id UUID;
    v_starts_at TIMESTAMPTZ;
    v_new_expires_at TIMESTAMPTZ;
    v_is_renewal BOOLEAN := FALSE;
BEGIN
    v_user_id := auth.uid();
    
    -- When invoked via service_role edge function, user_id can be inferred from payment record
    IF v_user_id IS NULL THEN
        SELECT user_id INTO v_user_id
        FROM public.payments
        WHERE (order_id = p_order_id OR razorpay_order_id = p_order_id)
        LIMIT 1;

        IF v_user_id IS NULL THEN
            RAISE EXCEPTION 'Unauthorized: User authentication required' USING ERRCODE = '40100';
        END IF;
    END IF;

    -- 1. Retrieve and lock payment record
    SELECT * INTO v_payment
    FROM public.payments
    WHERE (order_id = p_order_id OR razorpay_order_id = p_order_id)
      AND user_id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment order not found for user' USING ERRCODE = '40401';
    END IF;

    -- 2. Validate plan matches
    IF v_payment.plan_id != p_plan_id THEN
        RAISE EXCEPTION 'Mismatched subscription plan' USING ERRCODE = '40002';
    END IF;

    -- 3. Retrieve plan details and validate amount & currency
    SELECT * INTO v_plan
    FROM public.subscription_plans
    WHERE id = p_plan_id AND is_active = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Subscription plan not found or inactive' USING ERRCODE = '40400';
    END IF;

    IF v_payment.amount != v_plan.price THEN
        RAISE EXCEPTION 'Mismatched payment amount' USING ERRCODE = '40003';
    END IF;

    IF v_payment.currency != 'INR' THEN
        RAISE EXCEPTION 'Unsupported payment currency' USING ERRCODE = '40004';
    END IF;

    -- 4. Verify HMAC-SHA256 signature if secret is available in database
    SELECT key_secret INTO v_secret
    FROM public.payment_gateways
    WHERE gateway = 'razorpay' AND is_active = TRUE;

    -- If key_secret is present in database, verify signature strictly
    IF v_secret IS NOT NULL AND v_secret != '' THEN
        v_expected_signature := encode(hmac((p_order_id || '|' || p_payment_id)::bytea, v_secret::bytea, 'sha256'), 'hex');
        IF p_signature != v_expected_signature THEN
            RAISE EXCEPTION 'Forbidden: Invalid payment signature' USING ERRCODE = '40001';
        END IF;
    END IF;

    -- 5. Idempotency Check: if payment is already completed
    IF v_payment.status = 'completed' THEN
        SELECT s.id, s.status, s.starts_at, s.expires_at INTO v_active_sub
        FROM public.subscriptions s
        WHERE s.payment_id = v_payment.id
           OR (s.user_id = v_user_id AND s.status = 'active')
        ORDER BY s.expires_at DESC
        LIMIT 1;

        RETURN jsonb_build_object(
            'success', true,
            'message', 'Payment already verified and processed (idempotent)',
            'subscription_id', v_active_sub.id,
            'status', v_active_sub.status,
            'starts_at', v_active_sub.starts_at,
            'expires_at', v_active_sub.expires_at,
            'is_duplicate', true
        );
    END IF;

    -- 6. Reject duplicate razorpay_payment_id on different payment records
    IF EXISTS (
        SELECT 1 FROM public.payments
        WHERE razorpay_payment_id = p_payment_id
          AND id != v_payment.id
          AND status = 'completed'
    ) THEN
        RAISE EXCEPTION 'Duplicate payment ID already processed' USING ERRCODE = '40901';
    END IF;

    -- 7. Active subscription check (Renewal vs fresh purchase)
    SELECT * INTO v_active_sub
    FROM public.subscriptions
    WHERE user_id = v_user_id
      AND status = 'active'
      AND expires_at > NOW()
    ORDER BY expires_at DESC
    LIMIT 1;

    IF v_active_sub.id IS NOT NULL THEN
        -- Renewal: extend existing active subscription
        v_starts_at := v_active_sub.starts_at;
        v_new_expires_at := v_active_sub.expires_at + (v_plan.duration_days || ' days')::INTERVAL;

        UPDATE public.subscriptions
        SET expires_at = v_new_expires_at,
            payment_id = v_payment.id,
            updated_at = NOW()
        WHERE id = v_active_sub.id;

        v_subscription_id := v_active_sub.id;
        v_is_renewal := TRUE;
    ELSE
        -- Fresh purchase: start now
        v_starts_at := NOW();
        v_new_expires_at := NOW() + (v_plan.duration_days || ' days')::INTERVAL;

        INSERT INTO public.subscriptions (
            user_id,
            plan_id,
            payment_id,
            status,
            starts_at,
            expires_at
        )
        VALUES (
            v_user_id,
            v_plan.id,
            v_payment.id,
            'active',
            v_starts_at,
            v_new_expires_at
        )
        RETURNING id INTO v_subscription_id;

        v_is_renewal := FALSE;
    END IF;

    -- 8. Mark payment record as completed
    UPDATE public.payments
    SET status = 'completed',
        razorpay_order_id = p_order_id,
        razorpay_payment_id = p_payment_id,
        razorpay_signature = p_signature,
        updated_at = NOW()
    WHERE id = v_payment.id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Payment verified and Pro Pass activated successfully',
        'subscription_id', v_subscription_id,
        'status', 'active',
        'starts_at', v_starts_at,
        'expires_at', v_new_expires_at,
        'is_renewal', v_is_renewal,
        'is_duplicate', false
    );
END;
$$;

-- -------------------------------------------------------------
-- 4. HARDEN SECURITY DEFINER SEARCH PATHS ON CORE FUNCTIONS
-- -------------------------------------------------------------
ALTER FUNCTION public.has_role(UUID, TEXT) SET search_path = public, pg_temp;
ALTER FUNCTION public.is_admin() SET search_path = public, pg_temp;
ALTER FUNCTION public.has_active_subscription(UUID) SET search_path = public, pg_temp;
ALTER FUNCTION public.create_razorpay_order(TEXT) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_student_subscription_details() SET search_path = public, pg_temp;
ALTER FUNCTION public.get_admin_subscriptions(TEXT, TEXT, INT, INT) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_admin_payments(TEXT, TEXT, INT, INT) SET search_path = public, pg_temp;
ALTER FUNCTION public.reconcile_razorpay_webhook(TEXT, TEXT, NUMERIC, TEXT, TEXT) SET search_path = public, pg_temp;

-- Revoke unnecessary execute permissions from PUBLIC
REVOKE EXECUTE ON FUNCTION public.get_admin_subscriptions(TEXT, TEXT, INT, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_admin_payments(TEXT, TEXT, INT, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reconcile_razorpay_webhook(TEXT, TEXT, NUMERIC, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reconcile_razorpay_webhook(TEXT, TEXT, NUMERIC, TEXT, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.reconcile_razorpay_webhook(TEXT, TEXT, NUMERIC, TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_razorpay_webhook(TEXT, TEXT, NUMERIC, TEXT, TEXT) TO service_role;
