-- ============================================================================
-- PRACTICEKORO: MIGRATION 033 - RESTRICT SUPER ADMIN & RESET STUDENT ROLES
-- 1. Drops accidental 'super_admin' default from profiles.admin_role column
-- 2. Strictly demotes all non-admin accounts (including student test emails) to student
-- 3. Guarantees admin@practicekoro.online is the ONLY Super Admin
-- 4. Purges unauthorized admin rows from public.user_roles
-- 5. Adds remove_admin_staff_member RPC for secure UI demotions
-- ============================================================================

-- 1. Fix column default on public.profiles.admin_role
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'admin_role'
    ) THEN
        ALTER TABLE public.profiles ALTER COLUMN admin_role DROP DEFAULT;
        ALTER TABLE public.profiles ALTER COLUMN admin_role SET DEFAULT NULL;
    END IF;
END $$;

-- 2. Demote ALL accounts except admin@practicekoro.online to student
UPDATE public.profiles
SET 
    role = 'student',
    admin_role = NULL,
    updated_at = NOW()
WHERE LOWER(COALESCE(email, '')) <> 'admin@practicekoro.online';

-- 3. Explicitly reinforce admin@practicekoro.online as the Super Admin
UPDATE public.profiles
SET 
    role = 'admin',
    admin_role = 'super_admin',
    updated_at = NOW()
WHERE LOWER(COALESCE(email, '')) = 'admin@practicekoro.online';

-- 4. Remove 'admin' role in public.user_roles for any user except admin@practicekoro.online
DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id NOT IN (
      SELECT id FROM public.profiles 
      WHERE LOWER(COALESCE(email, '')) = 'admin@practicekoro.online'
  );

-- 5. Ensure all student accounts have the 'student' role in user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'student'
FROM public.profiles
WHERE LOWER(COALESCE(email, '')) <> 'admin@practicekoro.online'
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Ensure admin@practicekoro.online has the 'admin' role in user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM public.profiles
WHERE LOWER(COALESCE(email, '')) = 'admin@practicekoro.online'
ON CONFLICT (user_id, role) DO NOTHING;

-- 7. Hard Database Constraints:
-- a) A non-admin user can NEVER have an admin_role
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_student_no_admin_role;
ALTER TABLE public.profiles ADD CONSTRAINT chk_student_no_admin_role
CHECK (
    (role = 'admin' AND admin_role IN ('super_admin', 'content_writer', 'support_agent'))
    OR
    (role <> 'admin' AND admin_role IS NULL)
);

-- b) ONLY admin@practicekoro.online can EVER be Super Admin
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_only_primary_is_super_admin;
ALTER TABLE public.profiles ADD CONSTRAINT chk_only_primary_is_super_admin
CHECK (
    admin_role <> 'super_admin'
    OR LOWER(COALESCE(email, '')) = 'admin@practicekoro.online'
);

-- 8. Fail-safe Database Trigger: Prevents accidental escalation on INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.enforce_student_role_security()
RETURNS TRIGGER AS $$
BEGIN
    -- If email is NOT admin@practicekoro.online, block super_admin permanently
    IF LOWER(COALESCE(NEW.email, '')) <> 'admin@practicekoro.online' THEN
        IF NEW.admin_role = 'super_admin' THEN
            RAISE EXCEPTION 'Security Policy Violation: Only admin@practicekoro.online can be Super Admin'
                USING ERRCODE = '42501';
        END IF;
    END IF;

    -- If role is not admin (e.g. student), admin_role is forcefully kept NULL
    IF NEW.role <> 'admin' THEN
        NEW.admin_role := NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_student_role_security ON public.profiles;
CREATE TRIGGER trg_enforce_student_role_security
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_student_role_security();

-- 9. Secure RPC to remove / demote a staff member to regular student
CREATE OR REPLACE FUNCTION public.remove_admin_staff_member(
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_is_admin BOOLEAN := FALSE;
    v_target_email TEXT;
BEGIN
    -- Check caller authorization
    v_caller_is_admin := (
        public.has_role(auth.uid(), 'admin')
        OR EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        )
        OR (auth.jwt() ->> 'email') = 'admin@practicekoro.online'
    );

    IF NOT v_caller_is_admin THEN
        RAISE EXCEPTION 'Unauthorized: Only an authorized Super Admin can remove staff members'
            USING ERRCODE = '42501';
    END IF;

    -- Look up target user
    SELECT email INTO v_target_email
    FROM public.profiles
    WHERE id = p_user_id;

    IF v_target_email IS NULL THEN
        RAISE EXCEPTION 'User not found' USING ERRCODE = 'P0002';
    END IF;

    -- Prevent demoting primary platform admin
    IF LOWER(v_target_email) = 'admin@practicekoro.online' THEN
        RAISE EXCEPTION 'Cannot remove or demote the primary Super Admin (admin@practicekoro.online)'
            USING ERRCODE = '42501';
    END IF;

    -- Demote profile back to student
    UPDATE public.profiles
    SET role = 'student',
        admin_role = NULL,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Remove admin role from user_roles
    DELETE FROM public.user_roles
    WHERE user_id = p_user_id AND role = 'admin';

    -- Ensure student role exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_user_id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'email', v_target_email,
        'message', 'User has been successfully demoted to student'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.remove_admin_staff_member(UUID) TO authenticated, service_role;
