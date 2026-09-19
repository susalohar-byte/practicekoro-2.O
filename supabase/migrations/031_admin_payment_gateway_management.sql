-- ============================================================================
-- PRACTICEKORO: MIGRATION 031 - ADMIN PAYMENT GATEWAY MANAGEMENT
-- ============================================================================
-- Description:
--   1. Provides secure RPCs for verified administrators to read and update
--      payment gateway configurations (Razorpay Key ID, masked Secret Key,
--      Webhook Secret, and Active status) without leaking unmasked secrets to clients.
--   2. Preserves existing secrets when an administrator updates Key ID or active
--      status without entering a new secret.
--   3. Maintains strict RLS and role checks so regular students cannot read
--      or modify gateway configurations.
-- ============================================================================

-- Ensure payment_gateways table has updated_at column
ALTER TABLE public.payment_gateways ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ----------------------------------------------------------------------------
-- 1. SECURE RPC: admin_get_payment_gateway
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
    v_gw RECORD;
    v_target TEXT;
BEGIN
    -- Only administrators can read payment gateway configuration metadata
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: Admin privileges required' USING ERRCODE = '42501';
    END IF;

    v_target := LOWER(TRIM(COALESCE(p_gateway, 'razorpay')));

    SELECT * INTO v_gw
    FROM public.payment_gateways
    WHERE gateway = v_target;

    IF NOT FOUND THEN
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
        'gateway', v_gw.gateway,
        'key_id', COALESCE(v_gw.key_id, ''),
        'is_active', COALESCE(v_gw.is_active, FALSE),
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
        'updated_at', v_gw.updated_at
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. SECURE RPC: admin_update_payment_gateway
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
    v_target TEXT;
    v_clean_key_id TEXT;
    v_clean_secret TEXT;
    v_clean_webhook TEXT;
    v_existing RECORD;
    v_final_secret TEXT;
    v_final_webhook TEXT;
BEGIN
    -- Only administrators can update payment gateway configuration
    IF NOT public.has_role(auth.uid(), 'admin') THEN
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

    -- Upsert configuration
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

    -- Optional: Log in audit logs if table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'admin_audit_logs'
    ) THEN
        INSERT INTO public.admin_audit_logs (
            admin_id,
            admin_email,
            admin_name,
            admin_role,
            action,
            entity_type,
            entity_id,
            entity_name,
            details
        )
        VALUES (
            auth.uid(),
            'admin@practicekoro.online',
            'Administrator',
            'admin',
            'SETTINGS_UPDATE',
            'payment_gateway',
            v_target,
            'Razorpay Gateway Configuration',
            jsonb_build_object(
                'gateway', v_target,
                'key_id', v_clean_key_id,
                'is_active', p_is_active,
                'secret_updated', (v_clean_secret != '' AND v_clean_secret NOT LIKE '••••%'),
                'webhook_updated', (v_clean_webhook != '' AND v_clean_webhook NOT LIKE '••••%')
            )
        );
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Payment gateway configuration updated successfully'
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. PERMISSIONS GRANT
-- ----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.admin_get_payment_gateway(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_payment_gateway(TEXT, TEXT, TEXT, TEXT, BOOLEAN) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_get_payment_gateway(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_payment_gateway(TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;

GRANT EXECUTE ON FUNCTION public.admin_get_payment_gateway(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_payment_gateway(TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO service_role;
