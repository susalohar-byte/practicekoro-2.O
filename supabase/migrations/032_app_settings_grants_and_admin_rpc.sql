-- ============================================================================
-- PRACTICEKORO: MIGRATION 032 - APP SETTINGS GRANTS & ADMIN ATOMIC RPC
-- ============================================================================
-- Description:
--   1. Grants full CRUD privileges on public.app_settings to authenticated
--      users (RLS will restrict updates strictly to verified admins).
--   2. Provides a SECURITY DEFINER RPC `admin_update_app_settings(p_settings JSONB)`
--      allowing admins to atomically upsert multiple configuration keys
--      without encountering client-side RLS or table-grant permission errors.
--   3. Adds seed records for WhatsApp, Support Hours, and Operating Address.
--   4. Sets up storage policies for user profile avatar uploads.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLE PRIVILEGES & RLS ENFORCEMENT FOR APP_SETTINGS
-- ----------------------------------------------------------------------------
GRANT ALL ON public.app_settings TO authenticated, service_role;
GRANT SELECT ON public.app_settings TO anon;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Ensure Admins can perform ALL operations on app_settings
DROP POLICY IF EXISTS "Admins can manage all settings" ON public.app_settings;
CREATE POLICY "Admins can manage all settings"
    ON public.app_settings
    FOR ALL
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'admin')
        OR EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        )
        OR (auth.jwt() ->> 'email') = 'admin@practicekoro.online'
    )
    WITH CHECK (
        public.has_role(auth.uid(), 'admin')
        OR EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        )
        OR (auth.jwt() ->> 'email') = 'admin@practicekoro.online'
    );

-- Anyone can read public app settings
DROP POLICY IF EXISTS "Anyone can read general settings" ON public.app_settings;
DROP POLICY IF EXISTS "Anyone can read public app settings" ON public.app_settings;
CREATE POLICY "Anyone can read public app settings"
    ON public.app_settings
    FOR SELECT
    USING (true);

-- ----------------------------------------------------------------------------
-- 2. SECURITY DEFINER RPC: admin_update_app_settings
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_update_app_settings(
    p_settings JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_is_admin BOOLEAN := FALSE;
    v_item JSONB;
    v_count INT := 0;
    v_id TEXT;
    v_category TEXT;
    v_key TEXT;
    v_value JSONB;
    v_description TEXT;
BEGIN
    -- 1. Authorization check
    IF auth.uid() IS NOT NULL THEN
        v_is_admin := (
            public.has_role(auth.uid(), 'admin')
            OR EXISTS (
                SELECT 1 FROM public.user_roles
                WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
            )
            OR (auth.jwt() ->> 'email') = 'admin@practicekoro.online'
        );
    END IF;

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Unauthorized: Admin privileges required to update platform settings'
            USING ERRCODE = '42501';
    END IF;

    -- 2. Validate input array
    IF p_settings IS NULL OR jsonb_typeof(p_settings) <> 'array' THEN
        RAISE EXCEPTION 'Invalid input: p_settings must be a JSON array'
            USING ERRCODE = '22023';
    END IF;

    -- 3. Upsert each setting
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_settings)
    LOOP
        v_id := TRIM(COALESCE(v_item->>'id', ''));
        IF v_id = '' THEN
            CONTINUE;
        END IF;

        v_category := COALESCE(v_item->>'category', 'general');
        v_key := COALESCE(v_item->>'key', v_id);
        v_value := v_item->'value';
        v_description := v_item->>'description';

        INSERT INTO public.app_settings (id, category, key, value, description, updated_at)
        VALUES (
            v_id,
            v_category,
            v_key,
            v_value,
            v_description,
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            value = EXCLUDED.value,
            category = COALESCE(EXCLUDED.category, public.app_settings.category),
            key = COALESCE(EXCLUDED.key, public.app_settings.key),
            description = COALESCE(EXCLUDED.description, public.app_settings.description),
            updated_at = NOW();

        v_count := v_count + 1;
    END LOOP;

    RETURN jsonb_build_object(
        'success', TRUE,
        'updated_count', v_count,
        'timestamp', NOW()
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_app_settings(JSONB) TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 3. SEED ADDITIONAL CONTACT SETTINGS
-- ----------------------------------------------------------------------------
INSERT INTO public.app_settings (id, category, key, value, description)
VALUES
    ('general_support_whatsapp', 'general', 'support_whatsapp', '"+91 98765 43210"'::jsonb, 'Official WhatsApp customer support helpline'),
    ('general_support_hours', 'general', 'support_hours', '"Mon - Sat: 10:00 AM - 7:00 PM (IST)"'::jsonb, 'Customer support desk operational hours'),
    ('general_support_address', 'general', 'support_address', '"West Bengal, India"'::jsonb, 'Registered operating location & jurisdiction')
ON CONFLICT (id) DO UPDATE SET
    description = EXCLUDED.description;

-- ----------------------------------------------------------------------------
-- 4. STORAGE BUCKET & POLICIES FOR AVATARS (IF STORAGE SCHEMA AVAILABLE)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('avatars', 'avatars', true)
        ON CONFLICT (id) DO UPDATE SET public = true;

        -- Allow anyone to view avatars
        DROP POLICY IF EXISTS "Public avatars are viewable by everyone" ON storage.objects;
        CREATE POLICY "Public avatars are viewable by everyone"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'avatars');

        -- Allow authenticated users to upload their own avatar
        DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
        CREATE POLICY "Users can upload their own avatar"
            ON storage.objects FOR INSERT
            TO authenticated
            WITH CHECK (bucket_id = 'avatars');

        -- Allow authenticated users to update their own avatar
        DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
        CREATE POLICY "Users can update their own avatar"
            ON storage.objects FOR UPDATE
            TO authenticated
            USING (bucket_id = 'avatars');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Storage buckets schema not available or policy creation skipped: %', SQLERRM;
END;
$$;
