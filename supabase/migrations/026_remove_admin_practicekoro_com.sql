-- ============================================================================
-- PRACTICEKORO: MIGRATION 026 - REMOVE admin@practicekoro.com FROM ADMINS
-- ============================================================================
-- Description:
--   1. Revokes admin role from admin@practicekoro.com in public.user_roles and profiles.
--   2. Updates public.sync_admin_profile() RPC to only authorize admin@practicekoro.online.
--   3. Updates public.handle_new_user() trigger function to only promote admin@practicekoro.online.
-- ============================================================================

-- 1. Demote admin@practicekoro.com if present
DO $$
DECLARE
    v_target_id UUID;
BEGIN
    SELECT id INTO v_target_id
    FROM auth.users
    WHERE LOWER(email) = 'admin@practicekoro.com'
    LIMIT 1;

    IF v_target_id IS NOT NULL THEN
        -- Remove from user_roles
        DELETE FROM public.user_roles
        WHERE user_id = v_target_id AND role = 'admin';

        -- Update profile
        UPDATE public.profiles
        SET role = 'student', updated_at = NOW()
        WHERE id = v_target_id;

        RAISE NOTICE 'Demoted admin@practicekoro.com (ID: %) from admin', v_target_id;
    END IF;

    -- Also demote any standalone profile with that email
    UPDATE public.profiles
    SET role = 'student', updated_at = NOW()
    WHERE LOWER(email) = 'admin@practicekoro.com' AND role = 'admin';
END $$;

-- 2. Update sync_admin_profile() SECURITY DEFINER RPC
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

    IF LOWER(COALESCE(v_user_email, '')) = 'admin@practicekoro.online' THEN
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

-- 3. Update handle_new_user() trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role text := 'student';
    v_name text;
BEGIN
    IF LOWER(NEW.email) = 'admin@practicekoro.online' THEN
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
        WHEN LOWER(NEW.email) = 'admin@practicekoro.online' THEN 'admin'
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
