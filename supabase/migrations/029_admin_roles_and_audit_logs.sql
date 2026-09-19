-- ============================================================================
-- MIGRATION 029: MULTI-ADMIN RBAC & AUDIT LOGS
-- 1. Adds admin_role column to profiles table ('super_admin', 'content_writer', 'support_agent')
-- 2. Creates admin_audit_logs table for tracking all sensitive admin operations
-- 3. Configures RLS policies and indexes
-- ============================================================================

-- 1. Add admin_role column to public.profiles if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'admin_role'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN admin_role TEXT DEFAULT 'super_admin' 
        CHECK (admin_role IN ('super_admin', 'content_writer', 'support_agent'));
    END IF;
END $$;

-- 2. Create public.admin_audit_logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_email TEXT NOT NULL,
    admin_name TEXT,
    admin_role TEXT NOT NULL DEFAULT 'super_admin',
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    entity_name TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes for fast queries & filtering in Admin Dashboard
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.admin_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_email ON public.admin_audit_logs (admin_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.admin_audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.admin_audit_logs (entity_type);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Allow any authenticated user who is an admin to view audit logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.role = 'admin'
    )
    OR
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'admin'
    )
);

-- Allow authenticated admins to insert audit log records
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert audit logs"
ON public.admin_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.role = 'admin'
    )
    OR
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'admin'
    )
);

-- 6. Helper RPC to update staff admin role
CREATE OR REPLACE FUNCTION public.update_admin_staff_role(
    p_user_id UUID,
    p_admin_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    caller_role TEXT;
BEGIN
    -- Only existing super_admins can change staff roles
    SELECT admin_role INTO caller_role
    FROM public.profiles
    WHERE id = auth.uid();

    IF caller_role IS NOT NULL AND caller_role <> 'super_admin' THEN
        RAISE EXCEPTION 'Only super_admin can modify staff roles';
    END IF;

    IF p_admin_role NOT IN ('super_admin', 'content_writer', 'support_agent') THEN
        RAISE EXCEPTION 'Invalid admin sub-role: %', p_admin_role;
    END IF;

    -- Update profile
    UPDATE public.profiles
    SET role = 'admin',
        admin_role = p_admin_role,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Ensure entry exists in user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN jsonb_build_object('success', true, 'user_id', p_user_id, 'admin_role', p_admin_role);
END;
$$;
