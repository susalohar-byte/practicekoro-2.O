-- ============================================================================
-- PRACTICEKORO: MIGRATION 027 — BULK STUDENT ACTIONS & REFUND AUDIT
-- ============================================================================

-- Refund metadata is kept on the original payment row for simple reporting.
ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS refund_id TEXT,
    ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(8, 2),
    ADD COLUMN IF NOT EXISTS refund_reason TEXT,
    ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS refunded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_payments_refunded_at ON public.payments(refunded_at);

-- Student cohorts/batches used by the admin roster bulk actions.
CREATE TABLE IF NOT EXISTS public.student_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_batch_members (
    batch_id UUID NOT NULL REFERENCES public.student_batches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (batch_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_student_batch_members_user_id
    ON public.student_batch_members(user_id);

ALTER TABLE public.student_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_batch_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage student batches" ON public.student_batches;
CREATE POLICY "Admins can manage student batches"
    ON public.student_batches FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage student batch members" ON public.student_batch_members;
CREATE POLICY "Admins can manage student batch members"
    ON public.student_batch_members FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE ON public.student_batches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_batch_members TO authenticated;

-- Targeted notifications use an empty array for the existing broadcast behavior.
ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS recipient_ids UUID[] NOT NULL DEFAULT '{}'::UUID[];

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_ids
    ON public.notifications USING GIN (recipient_ids);

-- Replace the student read policy so targeted notices are visible only to recipients.
DROP POLICY IF EXISTS "Students can read sent notifications" ON public.notifications;
CREATE POLICY "Students can read sent notifications"
    ON public.notifications FOR SELECT TO authenticated
    USING (
        (
            status = 'sent'
            OR (
                status = 'scheduled'
                AND scheduled_at IS NOT NULL
                AND scheduled_at <= NOW()
            )
        )
        AND (
            COALESCE(cardinality(recipient_ids), 0) = 0
            OR auth.uid() = ANY(recipient_ids)
        )
    );

-- Atomically grant a plan to a selected roster.
CREATE OR REPLACE FUNCTION public.bulk_grant_student_subscription(
    p_user_ids UUID[],
    p_plan_id TEXT,
    p_duration_days INT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_count INT;
BEGIN
    IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Forbidden: Administrator privileges required' USING ERRCODE = '42501';
    END IF;
    IF p_duration_days IS NULL OR p_duration_days < 1 THEN
        RAISE EXCEPTION 'Duration must be at least one day';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE id = p_plan_id) THEN
        RAISE EXCEPTION 'Subscription plan not found';
    END IF;

    INSERT INTO public.subscriptions (user_id, plan_id, status, starts_at, expires_at)
    SELECT user_id, p_plan_id, 'active', NOW(), NOW() + make_interval(days => p_duration_days)
    FROM unnest(p_user_ids) AS selected(user_id);

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- Add selected students to a batch idempotently.
CREATE OR REPLACE FUNCTION public.bulk_assign_students_to_batch(
    p_batch_id UUID,
    p_user_ids UUID[]
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_count INT;
BEGIN
    IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Forbidden: Administrator privileges required' USING ERRCODE = '42501';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.student_batches WHERE id = p_batch_id AND is_active) THEN
        RAISE EXCEPTION 'Student batch not found or inactive';
    END IF;

    INSERT INTO public.student_batch_members (batch_id, user_id, assigned_by)
    SELECT p_batch_id, user_id, auth.uid()
    FROM unnest(p_user_ids) AS selected(user_id)
    ON CONFLICT (batch_id, user_id) DO UPDATE SET
        assigned_by = EXCLUDED.assigned_by,
        assigned_at = NOW();

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- Create a sent notification for an explicit set of recipients.
CREATE OR REPLACE FUNCTION public.create_targeted_notification(
    p_title TEXT,
    p_message TEXT,
    p_channel TEXT,
    p_user_ids UUID[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_id UUID;
BEGIN
    IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Forbidden: Administrator privileges required' USING ERRCODE = '42501';
    END IF;
    IF p_title IS NULL OR btrim(p_title) = '' OR p_message IS NULL OR btrim(p_message) = '' THEN
        RAISE EXCEPTION 'Notification title and message are required';
    END IF;

    INSERT INTO public.notifications (
        title, message, target_audience, channel, status, sent_at, created_by, recipient_ids
    )
    VALUES (
        p_title, p_message, 'selected', COALESCE(p_channel, 'in_app'), 'sent',
        NOW(), auth.uid(), COALESCE(p_user_ids, '{}'::UUID[])
    )
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$;

-- Record the result of an already-issued gateway refund.
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
BEGIN
    IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Forbidden: Administrator privileges required' USING ERRCODE = '42501';
    END IF;

    SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found';
    END IF;
    IF p_refund_amount IS NULL OR p_refund_amount <= 0 OR p_refund_amount > v_payment.amount THEN
        RAISE EXCEPTION 'Refund amount must be greater than zero and no greater than the payment amount';
    END IF;

    UPDATE public.payments
    SET status = 'refunded',
        refund_amount = p_refund_amount,
        refund_id = NULLIF(btrim(p_refund_id), ''),
        refund_reason = NULLIF(btrim(p_refund_reason), ''),
        refunded_at = NOW(),
        refunded_by = auth.uid()
    WHERE id = p_payment_id;
    RETURN TRUE;
END;
$$;

-- Keep the existing admin payment RPC compatible while exposing refund metadata.
CREATE OR REPLACE FUNCTION public.get_admin_payments(
    p_status TEXT DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_limit INT DEFAULT 50,
    p_offset INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_result JSONB;
BEGIN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Forbidden: Administrator privileges required' USING ERRCODE = '42501';
    END IF;

    SELECT jsonb_agg(pay_row) INTO v_result
    FROM (
        SELECT pm.id, pm.user_id, p.full_name AS student_name, p.email AS student_email,
            pm.plan_id, pl.title AS plan_title, pm.amount, pm.currency, pm.gateway,
            pm.order_id, pm.razorpay_order_id, pm.transaction_id, pm.razorpay_payment_id,
            pm.status, pm.refund_id, pm.refund_amount, pm.refund_reason, pm.refunded_at,
            pm.created_at
        FROM public.payments pm
        LEFT JOIN public.profiles p ON pm.user_id = p.id
        LEFT JOIN public.subscription_plans pl ON pm.plan_id = pl.id
        WHERE (p_status IS NULL OR pm.status = p_status)
          AND (
              p_search IS NULL
              OR pm.order_id ILIKE '%' || p_search || '%'
              OR pm.razorpay_payment_id ILIKE '%' || p_search || '%'
              OR p.full_name ILIKE '%' || p_search || '%'
              OR p.email ILIKE '%' || p_search || '%'
          )
        ORDER BY pm.created_at DESC
        LIMIT p_limit OFFSET p_offset
    ) pay_row;

    RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;

GRANT EXECUTE ON FUNCTION public.bulk_grant_student_subscription(UUID[], TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bulk_assign_students_to_batch(UUID, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_targeted_notification(TEXT, TEXT, TEXT, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_payment_refunded(UUID, NUMERIC, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_payments(TEXT, TEXT, INT, INT) TO authenticated;
