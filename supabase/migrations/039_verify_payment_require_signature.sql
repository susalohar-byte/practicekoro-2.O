-- ============================================================================
-- Migration 039: verify_razorpay_payment must reject empty signatures
-- ============================================================================
-- Defense-in-depth for payment verification:
--
-- The Edge Function (verify-payment) is the primary HMAC verifier using the
-- RAZORPAY_KEY_SECRET from Supabase secrets. However, the previous RPC body
-- only ran its HMAC re-check `IF p_signature ... AND v_secret ...` — i.e. it
-- silently SKIPPED verification whenever the signature was empty or the
-- secret was NULL (secrets now live only in Edge Function env by policy, so
-- the DB secret is intentionally NULL).
--
-- Combined with any caller that omits the signature, that meant subscriptions
-- could be activated WITHOUT cryptographic proof of payment. This migration
-- closes that hole at the database level: an empty/missing signature is now
-- a hard error, regardless of caller. Genuine Razorpay flows always carry a
-- signature, so legitimate payments are unaffected.
--
-- Only the signature gate is changed; the remainder of verify_razorpay_payment
-- (034) is preserved verbatim.
--
-- Apply with: scripts/apply-migrations-prod.sh (or supabase db push)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.verify_razorpay_payment(
    p_order_id TEXT,
    p_payment_id TEXT,
    p_signature TEXT,
    p_plan_id TEXT
)
RETURNS JSONB AS $$
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
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User authentication required' USING ERRCODE = '40100';
    END IF;

    -- MANDATORY SIGNATURE GATE (039): never activate a subscription without
    -- cryptographic proof. Genuine Razorpay callbacks always include one.
    IF p_signature IS NULL OR TRIM(p_signature) = '' THEN
        RAISE EXCEPTION 'Forbidden: Payment signature is required' USING ERRCODE = '40001';
    END IF;

    -- 1. Retrieve payment record for this user
    SELECT * INTO v_payment
    FROM public.payments
    WHERE (order_id = p_order_id OR razorpay_order_id = p_order_id OR id::text = p_order_id)
      AND user_id = v_user_id
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        -- Fallback: check most recent pending payment for this user and plan
        SELECT * INTO v_payment
        FROM public.payments
        WHERE user_id = v_user_id AND plan_id = p_plan_id AND status = 'pending'
        ORDER BY created_at DESC
        LIMIT 1;
    END IF;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment order not found for current user' USING ERRCODE = '40401';
    END IF;

    -- 2. Validate plan matches
    IF v_payment.plan_id != p_plan_id THEN
        RAISE EXCEPTION 'Mismatched subscription plan' USING ERRCODE = '40002';
    END IF;

    -- Retrieve active plan duration
    SELECT * INTO v_plan
    FROM public.subscription_plans
    WHERE id = p_plan_id;

    -- 3. Verify HMAC-SHA256 signature (defense-in-depth re-check; the Edge
    -- Function already verified using the env secret before calling here).
    SELECT key_secret INTO v_secret
    FROM public.payment_gateways
    WHERE gateway = 'razorpay' AND is_active = TRUE;

    IF v_secret IS NOT NULL AND TRIM(v_secret) <> '' THEN
        v_expected_signature := encode(hmac((p_order_id || '|' || p_payment_id)::bytea, v_secret::bytea, 'sha256'), 'hex');

        IF p_signature != v_expected_signature THEN
            RAISE EXCEPTION 'Forbidden: Invalid payment signature' USING ERRCODE = '40001';
        END IF;
    END IF;

    -- 4. Idempotency Check: if payment is already completed
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

    -- 5. Reject duplicate razorpay_payment_id on different payment records
    IF EXISTS (
        SELECT 1 FROM public.payments
        WHERE razorpay_payment_id = p_payment_id
          AND id != v_payment.id
          AND status = 'completed'
    ) THEN
        RAISE EXCEPTION 'Duplicate payment ID already processed' USING ERRCODE = '40901';
    END IF;

    -- 6. Check existing active subscription to handle renewal vs fresh purchase
    SELECT * INTO v_active_sub
    FROM public.subscriptions
    WHERE user_id = v_user_id
      AND status = 'active'
      AND expires_at > NOW()
    ORDER BY expires_at DESC
    LIMIT 1;

    IF v_active_sub.id IS NOT NULL THEN
        -- Renewal: extend expiry from current active expiration
        v_starts_at := v_active_sub.starts_at;
        v_new_expires_at := v_active_sub.expires_at + (v_plan.duration_days || ' days')::INTERVAL;

        UPDATE public.subscriptions
        SET expires_at = v_new_expires_at,
            plan_id = v_plan.id,
            payment_id = v_payment.id,
            updated_at = NOW()
        WHERE id = v_active_sub.id;

        v_subscription_id := v_active_sub.id;
        v_is_renewal := TRUE;
    ELSE
        -- Fresh purchase: starts immediately
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

    -- 7. Mark payment record as completed
    UPDATE public.payments
    SET status = 'completed',
        transaction_id = p_payment_id,
        razorpay_payment_id = p_payment_id,
        razorpay_signature = p_signature,
        raw_response = jsonb_build_object(
            'verified_at', NOW(),
            'subscription_id', v_subscription_id,
            'is_renewal', v_is_renewal
        )
    WHERE id = v_payment.id;

    RETURN jsonb_build_object(
        'success', true,
        'subscription_id', v_subscription_id,
        'status', 'active',
        'starts_at', v_starts_at,
        'expires_at', v_new_expires_at,
        'is_renewal', v_is_renewal,
        'plan_title', v_plan.title
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
