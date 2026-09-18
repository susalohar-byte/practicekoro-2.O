-- ============================================================================
-- PRACTICEKORO: MIGRATION 028 - APP SETTINGS UPSERT & MAINTENANCE RLS
-- ============================================================================
-- Description:
--   1. Expands RLS SELECT policy on public.app_settings so anon and authenticated
--      clients can read 'system' settings (including 'sys_maintenance_mode')
--      and 'subscription' settings in addition to 'general' and 'exam_defaults'.
--   2. Ensures default settings rows exist with ON CONFLICT (id) DO NOTHING.
--   3. Confirms admin full management policies for UPSERT support.
-- ============================================================================

-- 1. Update RLS policies for public.app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Drop previous restricted SELECT policy
DROP POLICY IF EXISTS "Anyone can read general settings" ON public.app_settings;
DROP POLICY IF EXISTS "Anyone can read public app settings" ON public.app_settings;

-- Allow reading public client settings: general, exam_defaults, system, subscription
CREATE POLICY "Anyone can read public app settings"
    ON public.app_settings
    FOR SELECT
    TO anon, authenticated
    USING (category IN ('general', 'exam_defaults', 'system', 'subscription'));

-- Ensure Admins have full access to manage/upsert all settings
DROP POLICY IF EXISTS "Admins can manage all settings" ON public.app_settings;
CREATE POLICY "Admins can manage all settings"
    ON public.app_settings
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Ensure grant permissions
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;

-- 2. Seed / Ensure Default Settings Rows
INSERT INTO public.app_settings (id, category, key, value, description) VALUES
    ('general_app_name', 'general', 'app_name', '"PracticeKoro"'::jsonb, 'Platform name displayed across UI'),
    ('general_support_email', 'general', 'support_email', '"support@practicekoro.online"'::jsonb, 'Support contact email'),
    ('general_support_phone', 'general', 'support_phone', '"+91 98765 43210"'::jsonb, 'Support phone helpline'),
    ('general_website_url', 'general', 'website_url', '"https://practicekoro.online"'::jsonb, 'Official web application domain'),
    ('exam_default_duration', 'exam_defaults', 'default_duration_minutes', '60'::jsonb, 'Standard default exam duration in minutes'),
    ('exam_default_marks', 'exam_defaults', 'default_marks_per_q', '1.0'::jsonb, 'Standard default marks per correct question'),
    ('exam_default_negative_marks', 'exam_defaults', 'default_negative_marks', '0.25'::jsonb, 'Standard default negative marking'),
    ('exam_passing_percentage', 'exam_defaults', 'default_passing_percentage', '35'::jsonb, 'Standard passing score percentage'),
    ('sub_currency', 'subscription', 'currency', '"INR"'::jsonb, 'Platform transaction currency'),
    ('sub_expiry_warning_days', 'subscription', 'expiry_warning_days', '7'::jsonb, 'Days before expiry to display renewal warning'),
    ('sys_maintenance_mode', 'system', 'maintenance_mode', 'false'::jsonb, 'Enable platform maintenance splash mode'),
    ('sys_app_version', 'system', 'app_version', '"2.0.0"'::jsonb, 'Platform production release version')
ON CONFLICT (id) DO NOTHING;
