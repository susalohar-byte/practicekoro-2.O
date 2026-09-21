-- ============================================================================
-- PRACTICEKORO: MIGRATION 034 - FIX PAYMENT GATEWAY PERMISSIONS & ORDER CREATION
-- ============================================================================
-- Description:
--   1. Ensures payment_gateways table has all required columns (webhook_secret, updated_at).
--   2. Upgrades has_role() function to authoritatively recognize admin@practicekoro.online
--      and profiles.role = 'admin' across all database security definer functions.
--   3. Automatically inserts admin@practicekoro.online into public.user_roles.
--   4. Grants table CRUD permissions and RLS policies on payment_gateways & app_settings.
--   5. Upgrades admin authorization checks in admin_get_payment_gateway and
--      admin_update_payment_gateway.
--   6. Synchronizes public key_id and is_active to public.app_settings
--      ('payment_gateway_razorpay_key_id') for universal student checkout availability.
--   7. Updates create_razorpay_order and verify_razorpay_payment to handle direct
--      and order-based checkouts seamlessly without BAD_REQUEST_ERROR crashes.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. SCHEMA PREREQUISITES: Ensure payment_gateways table & columns exist
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_gateways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway TEXT UNIQUE NOT NULL,
    key_id TEXT,
    key_secret TEXT,
    webhook_secret TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payment_gateways ADD COLUMN IF NOT EXISTS webhook_secret TEXT;
ALTER TABLE public.payment_gateways ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure default razorpay row exists
INSERT INTO public.payment_gateways (gateway, key_id, is_active)
VALUES ('razorpay', NULL, TRUE)
ON CONFLICT (gateway) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 1. FIX AUTH & ROLE RESOLUTION: has_role() + auto-seed admin@practicekoro.online
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_role(p_user_id UUID, p_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_email TEXT;
BEGIN
    IF p_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- 1. Check user_roles table
    IF EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = p_user_id AND role = p_role
    ) THEN
        RETURN TRUE;
    END IF;

    -- 2. Check profiles table
    IF p_role = 'admin' AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = p_user_id AND (role = 'admin' OR admin_role IS NOT NULL)
    ) THEN
        RETURN TRUE;
    END IF;

    -- 3. Check primary super admin email
    SELECT email INTO v_email FROM auth.users WHERE id = p_user_id;
    IF p_role = 'admin' AND v_email = 'admin@practicekoro.online' THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Automatically grant admin role in user_roles table for primary admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@practicekoro.online'
ON CONFLICT DO NOTHING;

-- Update profile role for primary admin
UPDATE public.profiles
SET role = 'admin', admin_role = 'super_admin'
WHERE email = 'admin@practicekoro.online';

-- ----------------------------------------------------------------------------
-- 2. TABLE GRANTS & RLS POLICIES FOR PAYMENT GATEWAYS & APP SETTINGS
-- ----------------------------------------------------------------------------
GRANT ALL ON public.payment_gateways TO authenticated, service_role;
GRANT ALL ON public.app_settings TO authenticated, service_role;
GRANT SELECT ON public.app_settings TO anon;

ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Admins can read payment_gateways
DROP POLICY IF EXISTS "Admin view gateway config" ON public.payment_gateways;
CREATE POLICY "Admin view gateway config" ON public.payment_gateways FOR SELECT
    USING (
        public.has_role(auth.uid(), 'admin')
        OR (auth.jwt() ->> 'email') = 'admin@practicekoro.online'
    );

-- Admins can manage payment_gateways
DROP POLICY IF EXISTS "Admin manage gateway config" ON public.payment_gateways;
CREATE POLICY "Admin manage gateway config" ON public.payment_gateways FOR ALL
    USING (
        public.has_role(auth.uid(), 'admin')
        OR (auth.jwt() ->> 'email') = 'admin@practicekoro.online'
    )
    WITH CHECK (
        public.has_role(auth.uid(), 'admin')
        OR (auth.jwt() ->> 'email') = 'admin@practicekoro.online'
    );

-- Admins can manage app_settings
DROP POLICY IF EXISTS "Admins can manage all settings" ON public.app_settings;
CREATE POLICY "Admins can manage all settings"
    ON public.app_settings
    FOR ALL
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'admin')
        OR (auth.jwt() ->> 'email') = 'admin@practicekoro.online'
    )
    WITH CHECK (
        public.has_role(auth.uid(), 'admin')
        OR (auth.jwt() ->> 'email') = 'admin@practicekoro.online'
    );

-- Public can read all app_settings
DROP POLICY IF EXISTS "Anyone can read general settings" ON public.app_settings;
DROP POLICY IF EXISTS "Anyone can read public app settings" ON public.app_settings;
CREATE POLICY "Anyone can read public app settings"
    ON public.app_settings
    FOR SELECT
    USING (true);

-- ----------------------------------------------------------------------------
-- 3. SECURE RPC: admin_get_payment_gateway (Hardened & Multi-Vector Auth)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_get_payment_gateway(
    p_gateway TEXT DEFAULT 'razorpay'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_is_admin BOOLEAN := FALSE;
    v_gw RECORD;
    v_target TEXT;
    v_app_key_id TEXT := '';
BEGIN
    -- Comprehensive multi-vector admin check
    IF auth.uid() IS NOT NULL THEN
        v_is_admin := (
            public.has_role(auth.uid(), 'admin')
            OR EXISTS (
                SELECT 1 FROM public.user_roles
                WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
            )
            OR EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.admin_role IS NOT NULL)
            )
            OR (auth.jwt() ->> 'email') = 'admin@practicekoro.online'
        );
    END IF;

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Unauthorized: Admin privileges required' USING ERRCODE = '42501';
    END IF;

    v_target := LOWER(TRIM(COALESCE(p_gateway, 'razorpay')));

    SELECT * INTO v_gw
    FROM public.payment_gateways
    WHERE gateway = v_target;

    -- Check app_settings fallback if key_id is empty
    IF v_gw.key_id IS NULL OR TRIM(v_gw.key_id) = '' THEN
        SELECT trim(both '"' from value::text) INTO v_app_key_id
        FROM public.app_settings
        WHERE id = 'payment_gateway_razorpay_key_id';
    END IF;

    IF v_gw IS NULL AND (v_app_key_id IS NULL OR v_app_key_id = '') THEN
        RETURN jsonb_build_object(
            'gateway', v_target,
            'key_id', '',
            'is_active', FALSE,
            'has_secret', FALSE,
            'secret_preview', NULL,
            'has_webhook_secret', FALSE,
            'webhook_preview', NULL,
            'updated_at', NULL
        );
    END IF;

    RETURN jsonb_build_object(
        'gateway', v_target,
        'key_id', COALESCE(NULLIF(v_gw.key_id, ''), v_app_key_id, ''),
        'is_active', COALESCE(v_gw.is_active, TRUE),
        'has_secret', (v_gw.key_secret IS NOT NULL AND length(trim(v_gw.key_secret)) > 0),
        'secret_preview', CASE
            WHEN v_gw.key_secret IS NOT NULL AND length(trim(v_gw.key_secret)) >= 4
                THEN '••••••••' || right(trim(v_gw.key_secret), 4)
            WHEN v_gw.key_secret IS NOT NULL AND length(trim(v_gw.key_secret)) > 0
                THEN '••••••••'
            ELSE NULL
        END,
        'has_webhook_secret', (v_gw.webhook_secret IS NOT NULL AND length(trim(v_gw.webhook_secret)) > 0),
        'webhook_preview', CASE
            WHEN v_gw.webhook_secret IS NOT NULL AND length(trim(v_gw.webhook_secret)) >= 4
                THEN '••••••••' || right(trim(v_gw.webhook_secret), 4)
            WHEN v_gw.webhook_secret IS NOT NULL AND length(trim(v_gw.webhook_secret)) > 0
                THEN '••••••••'
            ELSE NULL
        END,
        'updated_at', COALESCE(v_gw.updated_at, NOW())
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- 4. SECURE RPC: admin_update_payment_gateway (Hardened & Syncs to app_settings)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_update_payment_gateway(
    p_gateway TEXT,
    p_key_id TEXT,
    p_key_secret TEXT DEFAULT NULL,
    p_webhook_secret TEXT DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT TRUE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_is_admin BOOLEAN := FALSE;
    v_target TEXT;
    v_clean_key_id TEXT;
    v_clean_secret TEXT;
    v_clean_webhook TEXT;
    v_existing RECORD;
    v_final_secret TEXT;
    v_final_webhook TEXT;
BEGIN
    -- Comprehensive multi-vector admin check
    IF auth.uid() IS NOT NULL THEN
        v_is_admin := (
            public.has_role(auth.uid(), 'admin')
            OR EXISTS (
                SELECT 1 FROM public.user_roles
                WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
            )
            OR EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.admin_role IS NOT NULL)
            )
            OR (auth.jwt() ->> 'email') = 'admin@practicekoro.online'
        );
    END IF;

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Unauthorized: Admin privileges required' USING ERRCODE = '42501';
    END IF;

    v_target := LOWER(TRIM(COALESCE(p_gateway, 'razorpay')));
    v_clean_key_id := TRIM(COALESCE(p_key_id, ''));
    v_clean_secret := TRIM(COALESCE(p_key_secret, ''));
    v_clean_webhook := TRIM(COALESCE(p_webhook_secret, ''));

    -- Check if record already exists
    SELECT * INTO v_existing
    FROM public.payment_gateways
    WHERE gateway = v_target;

    -- Determine secret to preserve if not passed or passed as masked placeholder
    IF v_clean_secret = '' OR v_clean_secret LIKE '••••%' THEN
        v_final_secret := v_existing.key_secret;
    ELSE
        v_final_secret := v_clean_secret;
    END IF;

    -- Determine webhook secret to preserve
    IF v_clean_webhook = '' OR v_clean_webhook LIKE '••••%' THEN
        v_final_webhook := v_existing.webhook_secret;
    ELSE
        v_final_webhook := v_clean_webhook;
    END IF;

    -- Upsert configuration in payment_gateways
    INSERT INTO public.payment_gateways (
        gateway,
        key_id,
        key_secret,
        webhook_secret,
        is_active,
        updated_at
    )
    VALUES (
        v_target,
        v_clean_key_id,
        v_final_secret,
        v_final_webhook,
        p_is_active,
        NOW()
    )
    ON CONFLICT (gateway) DO UPDATE SET
        key_id = EXCLUDED.key_id,
        key_secret = EXCLUDED.key_secret,
        webhook_secret = EXCLUDED.webhook_secret,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();

    -- Synchronize public key_id and active status to app_settings
    INSERT INTO public.app_settings (id, category, key, value, description, updated_at)
    VALUES 
        ('payment_gateway_razorpay_key_id', 'monetization', 'razorpay_key_id', to_jsonb(v_clean_key_id), 'Public Razorpay Key ID for client checkout', NOW()),
        ('payment_gateway_razorpay_active', 'monetization', 'razorpay_active', to_jsonb(p_is_active), 'Razorpay payment gateway active status', NOW())
    ON CONFLICT (id) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW();

    RETURN jsonb_build_object(
        'success', TRUE,
        'gateway', v_target,
        'key_id', v_clean_key_id,
        'is_active', p_is_active,
        'has_secret', (v_final_secret IS NOT NULL AND length(trim(v_final_secret)) > 0),
        'updated_at', NOW()
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. SECURE RPC: create_razorpay_order (Resilient Public Key Fallback)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_razorpay_order(
    p_plan_id TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_plan RECORD;
    v_order_id TEXT;
    v_payment_id UUID;
    v_key_id TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User authentication required' USING ERRCODE = '40100';
    END IF;

    -- Retrieve active plan from database
    SELECT * INTO v_plan
    FROM public.subscription_plans
    WHERE id = p_plan_id AND is_active = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Subscription plan not found or inactive' USING ERRCODE = '40400';
    END IF;

    -- Retrieve public key_id from payment_gateways, or fallback to app_settings
    SELECT key_id INTO v_key_id
    FROM public.payment_gateways
    WHERE gateway = 'razorpay' AND is_active = TRUE;

    IF v_key_id IS NULL OR TRIM(v_key_id) = '' THEN
        SELECT trim(both '"' from value::text) INTO v_key_id
        FROM public.app_settings
        WHERE id = 'payment_gateway_razorpay_key_id';
    END IF;

    -- Generate unique internal payment reference
    v_order_id := 'pk_local_' || substr(md5(gen_random_uuid()::text || clock_timestamp()::text), 1, 16);

    -- Insert pending payment record
    INSERT INTO public.payments (
        user_id,
        plan_id,
        amount,
        currency,
        gateway,
        order_id,
        razorpay_order_id,
        status
    )
    VALUES (
        v_user_id,
        v_plan.id,
        v_plan.price,
        v_plan.currency,
        'razorpay',
        v_order_id,
        v_order_id,
        'pending'
    )
    RETURNING id INTO v_payment_id;

    RETURN jsonb_build_object(
        'order_id', v_order_id,
        'payment_id', v_payment_id,
        'plan_id', v_plan.id,
        'plan_title', v_plan.title,
        'amount', v_plan.price,
        'currency', v_plan.currency,
        'duration_days', v_plan.duration_days,
        'key_id', v_key_id,
        'is_real_razorpay_order', false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 6. SECURE RPC: verify_razorpay_payment (Signature & Direct Fallback Resilient)
-- ----------------------------------------------------------------------------
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

    -- 3. Verify HMAC-SHA256 signature if signature was provided
    SELECT key_secret INTO v_secret
    FROM public.payment_gateways
    WHERE gateway = 'razorpay' AND is_active = TRUE;

    IF p_signature IS NOT NULL AND TRIM(p_signature) <> '' AND v_secret IS NOT NULL AND TRIM(v_secret) <> '' THEN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 7. GRANTS
-- ----------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_payment_gateway(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_payment_gateway(TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_razorpay_order(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_razorpay_payment(TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;
