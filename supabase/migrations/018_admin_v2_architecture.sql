-- ============================================================================
-- PRACTICEKORO 2.0: MIGRATION 018 — ADMIN CONSOLE V2 ARCHITECTURE
-- ============================================================================
-- 1. Notifications table for student announcements and alerts
-- 2. Support Tickets table for student support desk
-- 3. App Settings table for global platform configuration
-- 4. Enhanced Admin Dashboard RPC: get_admin_dashboard_v2_stats
-- 5. Admin Student Roster RPC: get_admin_students
-- ============================================================================

-- 1. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target_audience TEXT NOT NULL DEFAULT 'all', -- 'all', 'free', 'pro', or 'exam:<exam_id>'
    channel TEXT NOT NULL DEFAULT 'in_app',       -- 'in_app', 'push', 'both'
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'scheduled')),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
CREATE POLICY "Admins can manage all notifications"
    ON public.notifications
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Students can read sent notifications" ON public.notifications;
CREATE POLICY "Students can read sent notifications"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (status = 'sent');

GRANT SELECT ON public.notifications TO anon, authenticated;
GRANT ALL ON public.notifications TO service_role;


-- 2. SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_name TEXT,
    student_email TEXT,
    subject TEXT NOT NULL,
    issue TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Other' CHECK (category IN (
        'Account Issue',
        'Payment Issue',
        'Subscription Issue',
        'Test Issue',
        'Result Issue',
        'Technical Issue',
        'Other'
    )),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved', 'closed')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON public.support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);

-- RLS for support_tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all support tickets" ON public.support_tickets;
CREATE POLICY "Admins can manage all support tickets"
    ON public.support_tickets
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Students can view and create their own tickets" ON public.support_tickets;
CREATE POLICY "Students can view and create their own tickets"
    ON public.support_tickets
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;


-- 3. GLOBAL APP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_app_settings_category ON public.app_settings(category);

-- RLS for app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all settings" ON public.app_settings;
CREATE POLICY "Admins can manage all settings"
    ON public.app_settings
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Anyone can read general settings" ON public.app_settings;
CREATE POLICY "Anyone can read general settings"
    ON public.app_settings
    FOR SELECT
    TO anon, authenticated
    USING (category IN ('general', 'exam_defaults'));

GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;

-- Seed Default Settings
INSERT INTO public.app_settings (id, category, key, value, description) VALUES
    ('general_app_name', 'general', 'app_name', '"PracticeKoro"'::jsonb, 'Platform name displayed across UI'),
    ('general_support_email', 'general', 'support_email', '"support@practicekoro.com"'::jsonb, 'Support contact email'),
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


-- 4. ENSURE MULTI-TIER SUBSCRIPTION PLANS EXIST
INSERT INTO public.subscription_plans (id, name, title, description, duration_days, price, original_price, currency, features, is_active, order_index) VALUES
    ('plan_free', 'Free Starter', 'Free Practice Plan', 'Access to select basic topic tests, daily questions, and community leaderboard.', 365, 0.00, 0.00, 'INR', '["Access to Free Mock Tests", "Basic Rank & Score Analysis", "Discussion Community"]'::jsonb, true, 0),
    ('plan_1_month', '1 Month Pass', '1-Month Pro Pass', 'Full universal access to all Mock Tests, PYQ Papers, and detailed Bengali solutions for 30 days.', 30, 99.00, 199.00, 'INR', '["All Full Mock Tests", "All PYQ Papers", "Detailed Bengali Explanations", "Mistakes Notebook"]'::jsonb, true, 1),
    ('plan_6_month', '6 Months Pass', '6-Months Pro Pass', 'Comprehensive exam preparation pass across all West Bengal state exams for 180 days.', 180, 199.00, 499.00, 'INR', '["All Full Mock Tests & PYQs", "Mistakes Notebook & Smart Revision", "Subject-wise Analytics", "Priority Support"]'::jsonb, true, 2),
    ('pro_1_year', 'PracticeKoro Pro Pass', '1-Year All-Access Pro Pass', 'Complete universal access to ALL Premium Mock Tests and Test Series across all exams for 365 days.', 365, 299.00, 999.00, 'INR', '["Universal access to ALL Premium Mock Tests", "Detailed Solutions & Bengali Explanations", "Automated Mistakes Notebook & Smart Revision", "State-Level Rank & Percentile Analytics", "All-Access Pass across WBP, KP SI, WBCS & WBPSC"]'::jsonb, true, 3)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    duration_days = EXCLUDED.duration_days,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    order_index = EXCLUDED.order_index;


-- 5. ADMIN RPC: get_admin_dashboard_v2_stats
DROP FUNCTION IF EXISTS public.get_admin_dashboard_v2_stats();
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_v2_stats()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_stats JSONB;
    v_total_revenue NUMERIC(10, 2);
    v_today_revenue NUMERIC(10, 2);
    v_month_revenue NUMERIC(10, 2);
    v_year_revenue NUMERIC(10, 2);
    v_total_students INT;
    v_new_students INT;
    v_active_students INT;
    v_pro_students INT;
    v_free_students INT;
    v_active_subs INT;
    v_total_exams INT;
    v_total_tests INT;
    v_topic_tests INT;
    v_full_mock_tests INT;
    v_pyq_tests INT;
    v_total_questions INT;
    v_topic_questions INT;
    v_full_mock_questions INT;
    v_pyq_questions INT;
    v_trend JSONB;
    v_recent_activity JSONB;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL OR NOT public.has_role(v_user_id, 'admin') THEN
        RAISE EXCEPTION 'Forbidden: Administrator privileges required' USING ERRCODE = '40300';
    END IF;

    -- Revenue Metrics
    SELECT COALESCE(SUM(amount), 0.00) INTO v_total_revenue
    FROM public.payments WHERE status = 'completed';

    SELECT COALESCE(SUM(amount), 0.00) INTO v_today_revenue
    FROM public.payments WHERE status = 'completed' AND created_at >= date_trunc('day', NOW());

    SELECT COALESCE(SUM(amount), 0.00) INTO v_month_revenue
    FROM public.payments WHERE status = 'completed' AND created_at >= date_trunc('month', NOW());

    SELECT COALESCE(SUM(amount), 0.00) INTO v_year_revenue
    FROM public.payments WHERE status = 'completed' AND created_at >= date_trunc('year', NOW());

    -- Student Metrics
    SELECT COUNT(*) INTO v_total_students
    FROM public.profiles WHERE role = 'student';

    SELECT COUNT(*) INTO v_new_students
    FROM public.profiles
    WHERE role = 'student' AND created_at >= (NOW() - INTERVAL '30 days');

    SELECT COUNT(DISTINCT user_id) INTO v_active_students
    FROM public.test_attempts
    WHERE created_at >= (NOW() - INTERVAL '30 days');

    SELECT COUNT(DISTINCT user_id) INTO v_pro_students
    FROM public.subscriptions
    WHERE status = 'active' AND expires_at > NOW();

    v_free_students := GREATEST(0, v_total_students - v_pro_students);

    SELECT COUNT(*) INTO v_active_subs
    FROM public.subscriptions
    WHERE status = 'active' AND expires_at > NOW();

    -- Content Metrics
    SELECT COUNT(*) INTO v_total_exams FROM public.exams;

    SELECT COUNT(*) INTO v_total_tests FROM public.tests;
    SELECT COUNT(*) INTO v_topic_tests FROM public.tests WHERE test_type IN ('topic', 'chapter_mock');
    SELECT COUNT(*) INTO v_full_mock_tests FROM public.tests WHERE test_type = 'full_mock';
    SELECT COUNT(*) INTO v_pyq_tests FROM public.tests WHERE test_type = 'pyq';

    SELECT COUNT(*) INTO v_total_questions FROM public.questions;
    SELECT COUNT(*) INTO v_topic_questions FROM public.questions WHERE source_type = 'topic' OR (source_type IS NULL AND chapter_id IS NOT NULL);
    SELECT COUNT(*) INTO v_full_mock_questions FROM public.questions WHERE source_type = 'other';
    SELECT COUNT(*) INTO v_pyq_questions FROM public.questions WHERE source_type = 'pyq';

    -- Revenue trend (last 7 days daily aggregate)
    SELECT COALESCE(jsonb_agg(d.item), '[]'::jsonb) INTO v_trend
    FROM (
        SELECT jsonb_build_object(
            'date', to_char(day_series, 'YYYY-MM-DD'),
            'label', to_char(day_series, 'Mon DD'),
            'amount', COALESCE(SUM(p.amount), 0)
        ) AS item
        FROM generate_series(
            date_trunc('day', NOW() - INTERVAL '6 days'),
            date_trunc('day', NOW()),
            INTERVAL '1 day'
        ) day_series
        LEFT JOIN public.payments p
            ON date_trunc('day', p.created_at) = day_series
            AND p.status = 'completed'
        GROUP BY day_series
        ORDER BY day_series ASC
    ) d;

    -- Recent activity feed (union of latest events)
    SELECT COALESCE(jsonb_agg(act), '[]'::jsonb) INTO v_recent_activity
    FROM (
        SELECT * FROM (
            SELECT
                p.id::text AS id,
                'payment' AS type,
                'New subscription purchase of ₹' || p.amount::text || ' by ' || COALESCE(pr.full_name, pr.email, 'Aspirant') AS description,
                p.created_at AS timestamp
            FROM public.payments p
            LEFT JOIN public.profiles pr ON pr.id = p.user_id
            WHERE p.status = 'completed'
            UNION ALL
            SELECT
                pr.id::text AS id,
                'registration' AS type,
                'New student registered: ' || COALESCE(pr.full_name, pr.email, 'Student') AS description,
                pr.created_at AS timestamp
            FROM public.profiles pr
            WHERE pr.role = 'student'
            UNION ALL
            SELECT
                t.id::text AS id,
                'test_created' AS type,
                'New test created: ' || t.title AS description,
                t.created_at AS timestamp
            FROM public.tests t
            UNION ALL
            SELECT
                e.id::text AS id,
                'exam_created' AS type,
                'Exam configured: ' || e.title AS description,
                e.created_at AS timestamp
            FROM public.exams e
        ) combined
        ORDER BY timestamp DESC
        LIMIT 10
    ) act;

    SELECT jsonb_build_object(
        'totalRevenue', v_total_revenue,
        'todayRevenue', v_today_revenue,
        'monthRevenue', v_month_revenue,
        'yearRevenue', v_year_revenue,
        'revenueTrend', v_trend,
        'totalStudents', v_total_students,
        'newStudents', v_new_students,
        'activeStudents', v_active_students,
        'freeStudents', v_free_students,
        'proStudents', v_pro_students,
        'activeSubscriptions', v_active_subs,
        'totalExams', v_total_exams,
        'totalTests', v_total_tests,
        'topicTests', v_topic_tests,
        'fullMockTests', v_full_mock_tests,
        'pyqTests', v_pyq_tests,
        'totalQuestions', v_total_questions,
        'topicQuestions', v_topic_questions,
        'fullMockQuestions', v_full_mock_questions,
        'pyqQuestions', v_pyq_questions,
        'recentActivity', v_recent_activity
    ) INTO v_stats;

    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- 6. ADMIN RPC: get_admin_students
DROP FUNCTION IF EXISTS public.get_admin_students(TEXT, TEXT, TEXT, INT, INT);
DROP FUNCTION IF EXISTS public.get_admin_students(TEXT, TEXT, TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.get_admin_students();
CREATE OR REPLACE FUNCTION public.get_admin_students(
    p_search TEXT DEFAULT NULL,
    p_plan TEXT DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_limit INT DEFAULT 50,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ,
    plan_title TEXT,
    plan_id TEXT,
    subscription_status TEXT,
    is_pro BOOLEAN,
    expires_at TIMESTAMPTZ,
    total_attempts BIGINT,
    last_active TIMESTAMPTZ
) AS $$
BEGIN
    IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Forbidden: Administrator privileges required' USING ERRCODE = '40300';
    END IF;

    RETURN QUERY
    WITH student_active_sub AS (
        SELECT DISTINCT ON (s.user_id)
            s.user_id,
            s.plan_id,
            p.title AS plan_title,
            s.status,
            s.expires_at,
            (s.status = 'active' AND s.expires_at > NOW()) AS is_active_pro
        FROM public.subscriptions s
        JOIN public.subscription_plans p ON s.plan_id = p.id
        ORDER BY s.user_id, s.created_at DESC
    ),
    student_attempt_stats AS (
        SELECT
            ta.user_id,
            COUNT(ta.id) AS attempts_count,
            MAX(ta.created_at) AS last_attempt_time
        FROM public.test_attempts ta
        GROUP BY ta.user_id
    )
    SELECT
        pr.id,
        pr.full_name,
        pr.email,
        pr.phone,
        pr.avatar_url,
        pr.created_at,
        COALESCE(sub.plan_title, 'Free Plan') AS plan_title,
        COALESCE(sub.plan_id, 'plan_free') AS plan_id,
        CASE
            WHEN sub.is_active_pro THEN 'active'
            WHEN sub.status IS NOT NULL THEN sub.status
            ELSE 'none'
        END AS subscription_status,
        COALESCE(sub.is_active_pro, false) AS is_pro,
        sub.expires_at,
        COALESCE(att.attempts_count, 0) AS total_attempts,
        COALESCE(att.last_attempt_time, pr.updated_at, pr.created_at) AS last_active
    FROM public.profiles pr
    LEFT JOIN student_active_sub sub ON sub.user_id = pr.id
    LEFT JOIN student_attempt_stats att ON att.user_id = pr.id
    WHERE pr.role = 'student'
      AND (
          p_search IS NULL OR
          pr.full_name ILIKE '%' || p_search || '%' OR
          pr.email ILIKE '%' || p_search || '%' OR
          pr.phone ILIKE '%' || p_search || '%'
      )
      AND (
          p_plan IS NULL OR
          (p_plan = 'free' AND COALESCE(sub.is_active_pro, false) = false) OR
          (p_plan = 'pro' AND COALESCE(sub.is_active_pro, false) = true) OR
          sub.plan_id = p_plan
      )
      AND (
          p_status IS NULL OR
          (p_status = 'active' AND COALESCE(sub.is_active_pro, false) = true) OR
          (p_status = 'expired' AND sub.status = 'expired') OR
          (p_status = 'none' AND sub.status IS NULL)
      )
    ORDER BY pr.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_v2_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_students(TEXT, TEXT, TEXT, INT, INT) TO authenticated;
