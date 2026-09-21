-- ============================================================================
-- PRACTICEKORO: MIGRATION 035 - AUTO REVOKE SUBSCRIPTION ON PAYMENT REFUND
-- ============================================================================
-- Description:
--   1. Updates mark_payment_refunded RPC so that marking any payment as refunded
--      automatically revokes the student's active Pro subscription, immediately
--      demoting them to the Free tier.
--   2. Adds reconcile_razorpay_refund RPC for Razorpay webhook handling so refunds
--      issued directly from the Razorpay dashboard also automatically revoke Pro access.
--   3. Automatically logs audit events in admin_audit_logs.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. UPGRADE mark_payment_refunded TO AUTOMATICALLY CANCEL PRO SUBSCRIPTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mark_payment_refunded(
    p_payment_id UUID,
    p_refund_amount NUMERIC,
    p_refund_id TEXT DEFAULT NULL,
    p_refund_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_payment public.payments%ROWTYPE;
    v_admin_email TEXT;
    v_admin_name TEXT;
BEGIN
    -- Check admin authorization
    IF auth.uid() IS NULL OR (
        NOT public.has_role(auth.uid(), 'admin') AND
        COALESCE(auth.jwt()->>'email', '') NOT IN ('admin@practicekoro.online', 'admin@practicekoro.com')
    ) THEN
        RAISE EXCEPTION 'Forbidden: Administrator privileges required' USING ERRCODE = '42501';
    END IF;

    -- Retrieve and lock the payment record
    SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found';
    END IF;

    IF p_refund_amount IS NULL OR p_refund_amount <= 0 OR p_refund_amount > v_payment.amount THEN
        RAISE EXCEPTION 'Refund amount must be greater than zero and no greater than the payment amount';
    END IF;

    -- 1. Mark payment as refunded in public.payments
    UPDATE public.payments
    SET status = 'refunded',
        refund_amount = p_refund_amount,
        refund_id = NULLIF(btrim(p_refund_id), ''),
        refund_reason = NULLIF(btrim(p_refund_reason), ''),
        refunded_at = NOW(),
        refunded_by = auth.uid(),
        updated_at = NOW()
    WHERE id = p_payment_id;

    -- 2. AUTOMATICALLY REVOKE ACTIVE PRO SUBSCRIPTION -> Return student to Free tier
    UPDATE public.subscriptions
    SET status = 'cancelled',
        expires_at = LEAST(expires_at, NOW()),
        updated_at = NOW()
    WHERE (
        payment_id = p_payment_id
        OR (user_id = v_payment.user_id AND plan_id = v_payment.plan_id)
    )
    AND status = 'active';

    -- 3. Write audit log entry if table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'admin_audit_logs'
    ) THEN
        v_admin_email := COALESCE(auth.jwt()->>'email', 'admin@practicekoro.online');
        v_admin_name := COALESCE(auth.jwt()->>'user_metadata'->>'full_name', 'Administrator');

        INSERT INTO public.admin_audit_logs (
            admin_id,
            admin_email,
            admin_name,
            admin_role,
            action,
            entity_type,
            entity_id,
            entity_name,
            details,
            created_at
        ) VALUES (
            auth.uid(),
            v_admin_email,
            v_admin_name,
            'admin',
            'PAYMENT_REFUND_AUTO_REVOKE_PRO',
            'payments',
            p_payment_id::text,
            'Payment Refund',
            jsonb_build_object(
                'refund_amount', p_refund_amount,
                'refund_id', p_refund_id,
                'refund_reason', p_refund_reason,
                'student_user_id', v_payment.user_id,
                'plan_id', v_payment.plan_id,
                'revoked_to_free', true
            ),
            NOW()
        );
    END IF;

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_payment_refunded(UUID, NUMERIC, TEXT, TEXT) TO authenticated;

-- ----------------------------------------------------------------------------
-- 2. ADD reconcile_razorpay_refund FOR WEBHOOK / DIRECT DASHBOARD REFUNDS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reconcile_razorpay_refund(
    p_payment_id TEXT,
    p_refund_id TEXT,
    p_refund_amount NUMERIC,
    p_refund_reason TEXT DEFAULT 'Razorpay webhook refund'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_payment public.payments%ROWTYPE;
BEGIN
    -- Locate payment record by razorpay_payment_id, id, or transaction_id
    SELECT * INTO v_payment 
    FROM public.payments 
    WHERE razorpay_payment_id = p_payment_id 
       OR id::text = p_payment_id
       OR transaction_id = p_payment_id
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'Payment record not found for refund reconciliation'
        );
    END IF;

    -- 1. Mark payment as refunded
    UPDATE public.payments
    SET status = 'refunded',
        refund_amount = COALESCE(p_refund_amount, v_payment.amount),
        refund_id = NULLIF(btrim(p_refund_id), ''),
        refund_reason = NULLIF(btrim(p_refund_reason), ''),
        refunded_at = NOW(),
        updated_at = NOW()
    WHERE id = v_payment.id;

    -- 2. Revoke associated active subscriptions
    UPDATE public.subscriptions
    SET status = 'cancelled',
        expires_at = LEAST(expires_at, NOW()),
        updated_at = NOW()
    WHERE (
        payment_id = v_payment.id
        OR (user_id = v_payment.user_id AND plan_id = v_payment.plan_id)
    )
    AND status = 'active';

    RETURN jsonb_build_object(
        'success', true, 
        'payment_id', v_payment.id, 
        'user_id', v_payment.user_id, 
        'status', 'refunded',
        'revoked_to_free', true
    );
END;
$$;

-- Secure reconcile_razorpay_refund to service_role and postgres only
REVOKE ALL ON FUNCTION public.reconcile_razorpay_refund(TEXT, TEXT, NUMERIC, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reconcile_razorpay_refund(TEXT, TEXT, NUMERIC, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.reconcile_razorpay_refund(TEXT, TEXT, NUMERIC, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_razorpay_refund(TEXT, TEXT, NUMERIC, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.reconcile_razorpay_refund(TEXT, TEXT, NUMERIC, TEXT) TO postgres;
