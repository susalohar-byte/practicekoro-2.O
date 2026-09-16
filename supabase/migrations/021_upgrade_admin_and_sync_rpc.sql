-- ============================================================================
-- PRACTICEKORO: MIGRATION 021 - UPGRADE ADMIN & SECURE SELF-SYNC RPC
-- ============================================================================
-- 1. Promotes admin@practicekoro.online and admin@practicekoro.com to 'admin'
--    in both public.user_roles and public.profiles.
-- 2. Creates public.sync_admin_profile() SECURITY DEFINER RPC so authorized
--    admin emails are automatically synced to 'admin' role upon sign-in.
-- 3. Updates handle_new_user() trigger to ensure admin emails are never
--    assigned 'student' role on registration or OAuth sign-in.
-- ============================================================================

-- 1. Upgrade existing admin accounts in public.user_roles and public.profiles
DO $$
DECLARE
    v_admin_user RECORD;
BEGIN
    FOR v_admin_user IN 
        SELECT id, email 
        FROM auth.users 
        WHERE LOWER(email) IN ('admin@practicekoro.online', 'admin@practicekoro.com')
    LOOP
        -- Add admin entry in user_roles
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_admin_user.id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;

        -- Remove any non-admin roles (e.g. legacy student role)
        DELETE FROM public.user_roles
        WHERE user_id = v_admin_user.id AND role <> 'admin';

        -- Update or insert profile with role 'admin'
        INSERT INTO public.profiles (id, full_name, email, role, updated_at)
        VALUES (v_admin_user.id, 'Administrator', v_admin_user.email, 'admin', NOW())
        ON CONFLICT (id) DO UPDATE
        SET role = 'admin', updated_at = NOW();

        RAISE NOTICE 'Upgraded user % (ID %) to admin', v_admin_user.email, v_admin_user.id;
    END LOOP;

    -- Also catch any profile that exists without auth.users entry or created previously
    UPDATE public.profiles
    SET role = 'admin', updated_at = NOW()
    WHERE LOWER(email) IN ('admin@practicekoro.online', 'admin@practicekoro.com');
END $$;

-- 2. Create SECURITY DEFINER RPC to allow authorized admin emails to self-sync
CREATE OR REPLACE FUNCTION public.sync_admin_profile()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- Look up caller's email from auth.users
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = v_user_id;

    -- Fallback to profiles table if needed
    IF v_user_email IS NULL THEN
        SELECT email INTO v_user_email
        FROM public.profiles
        WHERE id = v_user_id;
    END IF;

    IF LOWER(COALESCE(v_user_email, '')) IN ('admin@practicekoro.online', 'admin@practicekoro.com') THEN
        -- Insert admin role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;

        -- Remove any conflicting student role
        DELETE FROM public.user_roles
        WHERE user_id = v_user_id AND role <> 'admin';

        -- Update profiles table
        UPDATE public.profiles
        SET role = 'admin', updated_at = NOW()
        WHERE id = v_user_id;

        RETURN jsonb_build_object('success', true, 'role', 'admin', 'email', v_user_email);
    END IF;

    RETURN jsonb_build_object('success', false, 'error', 'User is not an authorized administrator email');
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_admin_profile() TO authenticated;

-- 3. Update handle_new_user() trigger function to enforce admin role for designated emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role text := 'student';
    v_name text;
BEGIN
    IF LOWER(NEW.email) IN ('admin@practicekoro.online', 'admin@practicekoro.com') THEN
        v_role := 'admin';
    END IF;

    v_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );

    INSERT INTO public.profiles (id, full_name, email, avatar_url, role)
    VALUES (
        NEW.id,
        v_name,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL),
        v_role
    )
    ON CONFLICT (id) DO UPDATE
    SET role = CASE
        WHEN LOWER(NEW.email) IN ('admin@practicekoro.online', 'admin@practicekoro.com') THEN 'admin'
        ELSE public.profiles.role
    END,
    avatar_url = COALESCE(
        public.profiles.avatar_url,
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        NULL
    );

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, v_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
