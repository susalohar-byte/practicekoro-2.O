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
-- ============================================================================
-- PRACTICEKORO 2.0: MIGRATION 019 — ADMIN V2 PERFORMANCE & INDEX POLISH
-- ============================================================================
-- Purely additive: Ensures optimal index coverage for high-volume Question Bank
-- filtering by source, subject, topic, exam, status, and creation date.
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_questions_created_at ON public.questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_source_exam ON public.questions(source_exam);
CREATE INDEX IF NOT EXISTS idx_questions_source_type_status ON public.questions(source_type, status);
CREATE INDEX IF NOT EXISTS idx_questions_subject_topic ON public.questions(subject_id, topic_id);

-- Ensure test_questions has index on test_id and question_id for fast joins
CREATE INDEX IF NOT EXISTS idx_test_questions_test_id ON public.test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_question_id ON public.test_questions(question_id);
-- ============================================================================
-- Migration 020: Purge Legacy Questions & Seed Complete Bengali Questions
-- Description:
--   1. Deletes all existing test questions, attempt answers, mistakes, and questions
--   2. Inserts authentic Bengali competitive exam questions (WBP, KP, Bengali Literature, General Science, Polity)
--   3. All question texts, options (A, B, C, D) and explanations are 100% in Bengali
-- ============================================================================

-- 1. CLEAN UP EXISTING QUESTIONS
DELETE FROM public.attempt_answers;
DELETE FROM public.mistakes;
DELETE FROM public.test_questions;
DELETE FROM public.questions;

-- 2. ENSURE BENGALI LITERATURE & POLITY SUBJECT & TOPIC EXIST
INSERT INTO public.subjects (id, exam_id, name, slug, description, icon_name, order_index) VALUES
  ('wbp-bengali', 'wbp-constable', 'Bengali Literature (বাংলা সাহিত্য ও ভাষা)', 'bengali-literature', 'বাংলা সাহিত্যের ধ্রুপদী রচনা, লেখক পরিচিতি ও ব্যাকরণ।', 'BookOpen', 5),
  ('wbp-polity', 'wbp-constable', 'Indian Constitution (ভারতের সংবিধান)', 'indian-constitution', 'Preamble, Fundamental Rights, Directive Principles, and Governance.', 'Scale', 4)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

INSERT INTO public.chapters (id, subject_id, name, slug, description, order_index) VALUES
  ('wbp-bengali-lit', 'wbp-bengali', 'Bengali Literature', 'bengali-literature-classics', 'কাব্যগ্রন্থ, উপন্যাস, নাটক ও সাহিত্যিকদের গুরুত্বপূর্ণ তথ্য।', 1),
  ('wbp-polity-rights', 'wbp-polity', 'Fundamental Rights & Duties (মৌলিক অধিকার ও কর্তব্য)', 'fundamental-rights-duties', 'Articles 12 to 35, Writs, 42nd & 44th Constitutional Amendments.', 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;


-- 3. INSERT FRESH BENGALI QUESTIONS
INSERT INTO public.questions (
  id,
  chapter_id,
  subject_id,
  question_text,
  question_bengali_text,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_option,
  explanation,
  explanation_bengali,
  difficulty,
  default_marks,
  default_negative_marks,
  source_type,
  source_exam,
  source_year,
  source_paper,
  status,
  is_active
) VALUES
  -- Bengali Literature Questions (matching user specification)
  (
    'a0000000-0000-0000-0000-000000000101',
    'wbp-bengali-lit',
    'wbp-bengali',
    'রবীন্দ্রনাথ ঠাকুরের ''গীতাঞ্জলি'' কাব্যগ্রন্থটি কোন সালে প্রকাশিত হয়?',
    'রবীন্দ্রনাথ ঠাকুরের ''গীতাঞ্জলি'' কাব্যগ্রন্থটি কোন সালে প্রকাশিত হয়?',
    '১৯১০',
    '১৯১২',
    '১৯১৪',
    '১৯১৬',
    'A',
    'রবীন্দ্রনাথ ঠাকুরের বিখ্যাত ''গীতাঞ্জলি'' কাব্যগ্রন্থটি ১৯১০ সালে বাংলায় প্রকাশিত হয়। পরবর্তীতে এর ইংরেজি অনুবাদের (Song Offerings) জন্য তিনি ১৯১৩ সালে সাহিত্যে নোবেল পুরস্কার পান।',
    'রবীন্দ্রনাথ ঠাকুরের বিখ্যাত ''গীতাঞ্জলি'' কাব্যগ্রন্থটি ১৯১০ সালে বাংলায় প্রকাশিত হয়। পরবর্তীতে এর ইংরেজি অনুবাদের (Song Offerings) জন্য তিনি ১৯১৩ সালে সাহিত্যে নোবেল পুরস্কার পান।',
    'easy',
    1.00,
    0.25,
    'topic',
    'wbp-constable',
    NULL,
    NULL,
    'active',
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000102',
    'wbp-bengali-lit',
    'wbp-bengali',
    'বাংলা সাহিত্যের প্রথম সার্থক উপন্যাস কোনটি?',
    'বাংলা সাহিত্যের প্রথম সার্থক উপন্যাস কোনটি?',
    'আলালের ঘরের দুলাল',
    'দুর্গেশনন্দিনী',
    'কপালকুণ্ডলা',
    'চোখের বালি',
    'B',
    '১৮৬৫ সালে প্রকাশিত সাহিত্যসম্রাট বঙ্কিমচন্দ্র চট্টোপাধ্যায়ের ''দুর্গেশনন্দিনী'' উপন্যাসটিকে বাংলা সাহিত্যের প্রথম সার্থক উপন্যাস হিসেবে গণ্য করা হয়।',
    '১৮৬৫ সালে প্রকাশিত সাহিত্যসম্রাট বঙ্কিমচন্দ্র চট্টোপাধ্যায়ের ''দুর্গেশনন্দিনী'' উপন্যাসটিকে বাংলা সাহিত্যের প্রথম সার্থক উপন্যাস হিসেবে গণ্য করা হয়।',
    'easy',
    1.00,
    0.25,
    'topic',
    'wbp-constable',
    NULL,
    NULL,
    'active',
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000103',
    'wbp-bengali-lit',
    'wbp-bengali',
    'ভারতের জাতীয় গান ''বন্দে মাতরম্'' বঙ্কিমচন্দ্রের কোন উপন্যাস থেকে গৃহীত হয়েছে?',
    'ভারতের জাতীয় গান ''বন্দে মাতরম্'' বঙ্কিমচন্দ্রের কোন উপন্যাস থেকে গৃহীত হয়েছে?',
    'আনন্দমঠ',
    'দেবী চৌধুরাণী',
    'রাজসিংহ',
    'সীতারাম',
    'A',
    'বঙ্কিমচন্দ্র চট্টোপাধ্যায়ের বিখ্যাত রাজনৈতিক ও ঐতিহাসিক উপন্যাস ''আনন্দমঠ'' (১৮৮২) থেকে ''বন্দে মাতরম্'' গানটি নেওয়া হয়েছে।',
    'বঙ্কিমচন্দ্র চট্টোপাধ্যায়ের বিখ্যাত রাজনৈতিক ও ঐতিহাসিক উপন্যাস ''আনন্দমঠ'' (১৮৮২) থেকে ''বন্দে মাতরম্'' গানটি নেওয়া হয়েছে।',
    'easy',
    1.00,
    0.25,
    'topic',
    'wbp-constable',
    NULL,
    NULL,
    'active',
    true
  ),

  -- Indus Valley History Drill Questions
  (
    'a0000000-0000-0000-0000-000000000001',
    'wbp-hist-indus',
    'wbp-history',
    '১৯২১ সালে হরপ্পা প্রত্নক্ষেত্রটি কে আবিষ্কার করেছিলেন?',
    '১৯২১ সালে হরপ্পা প্রত্নক্ষেত্রটি কে আবিষ্কার করেছিলেন?',
    'রাখালদাস বন্দ্যোপাধ্যায়',
    'দয়ারাম সাহনি',
    'স্যার জন মার্শাল',
    'আলেকজান্ডার কানিংহাম',
    'B',
    '১৯২১ সালে ভারতীয় প্রত্নতাত্ত্বিক দয়ারাম সাহনি স্যার জন মার্শালের তত্ত্বাবধানে হরপ্পা প্রত্নক্ষেত্রটি আবিষ্কার করেন।',
    '১৯২১ সালে ভারতীয় প্রত্নতাত্ত্বিক দয়ারাম সাহনি স্যার জন মার্শালের তত্ত্বাবধানে হরপ্পা প্রত্নক্ষেত্রটি আবিষ্কার করেন।',
    'easy',
    1.00,
    0.25,
    'topic',
    'wbp-constable',
    NULL,
    NULL,
    'active',
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'wbp-hist-indus',
    'wbp-history',
    'সিন্ধু সভ্যতার বিখ্যাত বৃহৎ স্নানাগারটি (Great Bath) কোথায় পাওয়া গেছে?',
    'সিন্ধু সভ্যতার বিখ্যাত বৃহৎ স্নানাগারটি (Great Bath) কোথায় পাওয়া গেছে?',
    'হরপ্পা',
    'লোথাল',
    'মহেঞ্জোদারো',
    'কালিবঙ্গান',
    'C',
    'সিন্ধু সভ্যতার বিখ্যাত বৃহৎ স্নানাগারটি মহেঞ্জোদারোতে অবস্থিত, যা পোড়ামাটির ইট ও বিটুমিন দিয়ে জলনিরোধক করা হয়েছিল।',
    'সিন্ধু সভ্যতার বিখ্যাত বৃহৎ স্নানাগারটি মহেঞ্জোদারোতে অবস্থিত, যা পোড়ামাটির ইট ও বিটুমিন দিয়ে জলনিরোধক করা হয়েছিল।',
    'easy',
    1.00,
    0.25,
    'topic',
    'wbp-constable',
    NULL,
    NULL,
    'active',
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'wbp-hist-indus',
    'wbp-history',
    'সিন্ধু সভ্যতার কোন শহরটিতে প্রাচীন কৃত্রিম পোতাশ্রয় বা ডকইয়ার্ড ছিল?',
    'সিন্ধু সভ্যতার কোন শহরটিতে প্রাচীন কৃত্রিম পোতাশ্রয় বা ডকইয়ার্ড ছিল?',
    'লোথাল',
    'সুরকোটাদা',
    'বনওয়ালি',
    'রাখিগড়ী',
    'A',
    'গুজরাটের ভোগাবর নদীর তীরে অবস্থিত লোথালে বিশ্বের প্রাচীনতম কৃত্রিম সামুদ্রিক বন্দর বা ডকইয়ার্ড আবিষ্কৃত হয়েছে।',
    'গুজরাটের ভোগাবর নদীর তীরে অবস্থিত লোথালে বিশ্বের প্রাচীনতম কৃত্রিম সামুদ্রিক বন্দর বা ডকইয়ার্ড আবিষ্কৃত হয়েছে।',
    'medium',
    1.00,
    0.25,
    'topic',
    'wbp-constable',
    NULL,
    NULL,
    'active',
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    'wbp-hist-indus',
    'wbp-history',
    'সিন্ধু সভ্যতা মূলত কোন ঐতিহাসিক যুগের অন্তর্গত ছিল?',
    'সিন্ধু সভ্যতা মূলত কোন ঐতিহাসিক যুগের অন্তর্গত ছিল?',
    'প্রাচীন প্রস্তর যুগ',
    'মধ্য প্রস্তর যুগ',
    'তাম্র-ব্রোঞ্জ যুগ',
    'লৌহ যুগ',
    'C',
    'সিন্ধু সভ্যতা তাম্র-ব্রোঞ্জ যুগের (Bronze Age) একটি সুপরিকল্পিত নগরকেন্দ্রিক সভ্যতা ছিল। হরপ্পাবাসীদের লোহার ব্যবহার অজানা ছিল।',
    'সিন্ধু সভ্যতা তাম্র-ব্রোঞ্জ যুগের (Bronze Age) একটি সুপরিকল্পিত নগরকেন্দ্রিক সভ্যতা ছিল। হরপ্পাবাসীদের লোহার ব্যবহার অজানা ছিল।',
    'medium',
    1.00,
    0.25,
    'topic',
    'wbp-constable',
    NULL,
    NULL,
    'active',
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000005',
    'wbp-hist-indus',
    'wbp-history',
    'সিন্ধু সভ্যতার কোন কেন্দ্রে লাঙল দেওয়া চাষের জমির প্রমাণ পাওয়া গেছে?',
    'সিন্ধু সভ্যতার কোন কেন্দ্রে লাঙল দেওয়া চাষের জমির প্রমাণ পাওয়া গেছে?',
    'চানহুদারো',
    'কালিবঙ্গান',
    'ধোলাভিরা',
    'কোট দিজি',
    'B',
    'রাজস্থানের কালিবঙ্গানে লাঙল দিয়ে চষা কৃষিজমি ও পারস্পরিক সমকোণে থাকা খাঁজের সুস্পষ্ট প্রমাণ পাওয়া গেছে।',
    'রাজস্থানের কালিবঙ্গানে লাঙল দিয়ে চষা কৃষিজমি ও পারস্পরিক সমকোণে থাকা খাঁজের সুস্পষ্ট প্রমাণ পাওয়া গেছে।',
    'hard',
    1.00,
    0.25,
    'topic',
    'wbp-constable',
    NULL,
    NULL,
    'active',
    true
  ),

  -- General Knowledge & Science Questions (Full Mock)
  (
    'a0000000-0000-0000-0000-000000000201',
    NULL,
    'wbp-science',
    'আমাদের সৌরজগতের কোন গ্রহকে ''লাল গ্রহ'' বলা হয়?',
    'আমাদের সৌরজগতের কোন গ্রহকে ''লাল গ্রহ'' বলা হয়?',
    'শুক্র',
    'মঙ্গল',
    'বৃহস্পতি',
    'শনি',
    'B',
    'মঙ্গল গ্রহের পৃষ্ঠে প্রচুর পরিমাণে আয়রন অক্সাইড (মরিচা) থাকার কারণে মহাকাশ থেকে এটি লালচে দেখায়, তাই একে লাল গ্রহ বলে।',
    'মঙ্গল গ্রহের পৃষ্ঠে প্রচুর পরিমাণে আয়রন অক্সাইড (মরিচা) থাকার কারণে মহাকাশ থেকে এটি লালচে দেখায়, তাই একে লাল গ্রহ বলে।',
    'easy',
    1.00,
    0.25,
    'other',
    'wbp-constable',
    NULL,
    NULL,
    'active',
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000202',
    NULL,
    'wbp-polity',
    'ভারতের সংবিধানের জনক ও প্রধান রূপকার কাকে বলা হয়?',
    'ভারতের সংবিধানের জনক ও প্রধান রূপকার কাকে বলা হয়?',
    'ড. বি. আর. আম্বেদকর',
    'মহাত্মা গান্ধী',
    'জওহরলাল নেহরু',
    'ড. রাজেন্দ্র প্রসাদ',
    'A',
    'ড. ভীমরাও রামজি আম্বেদকর সংবিধানের খসড়া কমিটির সভাপতি ছিলেন এবং তাঁকেই ভারতীয় সংবিধানের জনক বলা হয়।',
    'ড. ভীমরাও রামজি আম্বেদকর সংবিধানের খসড়া কমিটির সভাপতি ছিলেন এবং তাঁকেই ভারতীয় সংবিধানের জনক বলা হয়।',
    'easy',
    1.00,
    0.25,
    'other',
    'wbp-constable',
    NULL,
    NULL,
    'active',
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000203',
    NULL,
    'wbp-science',
    'মানবদেহের স্বাভাবিক রক্তচাপ (Blood Pressure) কত?',
    'মানবদেহের স্বাভাবিক রক্তচাপ (Blood Pressure) কত?',
    '১২০/৮০ মিমি পারদ স্তম্ভ',
    '১৪০/৯০ মিমি পারদ স্তম্ভ',
    '১০০/৬০ মিমি পারদ স্তম্ভ',
    '৮০/১২০ মিমি পারদ স্তম্ভ',
    'A',
    'সুস্থ প্রাপ্তবয়স্ক মানুষের স্বাভাবিক রক্তচাপ হলো ১২০/৮০ mmHg (সিস্টোলিক ১২০ ও ডায়াস্টোলিক ৮০ মিমি পারদ স্তম্ভ)।',
    'সুস্থ প্রাপ্তবয়স্ক মানুষের স্বাভাবিক রক্তচাপ হলো ১২০/৮০ mmHg (সিস্টোলিক ১২০ ও ডায়াস্টোলিক ৮০ মিমি পারদ স্তম্ভ)।',
    'easy',
    1.00,
    0.25,
    'other',
    'wbp-constable',
    NULL,
    NULL,
    'active',
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000204',
    NULL,
    'wbp-science',
    'কোষের ''শক্তিঘর'' (Powerhouse of the Cell) কাকে বলা হয়?',
    'কোষের ''শক্তিঘর'' (Powerhouse of the Cell) কাকে বলা হয়?',
    'রাইবোজোম',
    'লাইসোজোম',
    'মাইটোকনড্রিয়া',
    'গলগি বডি',
    'C',
    'মাইটোকনড্রিয়ায় শ্বসনের মাধ্যমে কোষীয় শক্তি ATP উৎপন্ন ও সঞ্চিত থাকে বলে একে কোষের শক্তিঘর বলা হয়।',
    'মাইটোকনড্রিয়ায় শ্বসনের মাধ্যমে কোষীয় শক্তি ATP উৎপন্ন ও সঞ্চিত থাকে বলে একে কোষের শক্তিঘর বলা হয়।',
    'easy',
    1.00,
    0.25,
    'other',
    'wbp-constable',
    NULL,
    NULL,
    'active',
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000205',
    NULL,
    'wbp-polity',
    'পশ্চিমবঙ্গের সরকারি রাজ্য পশু (State Animal) কোনটি?',
    'পশ্চিমবঙ্গের সরকারি রাজ্য পশু (State Animal) কোনটি?',
    'রয়্যাল বেঙ্গল টাইগার',
    'মেছো বিড়াল (Fishing Cat)',
    'একশৃঙ্গ গণ্ডার',
    'চিতাবাঘ',
    'B',
    'পশ্চিমবঙ্গের সরকারি রাজ্য পশু হলো মেছো বিড়াল বা বাঘরোল (Fishing Cat)।',
    'পশ্চিমবঙ্গের সরকারি রাজ্য পশু হলো মেছো বিড়াল বা বাঘরোল (Fishing Cat)।',
    'easy',
    1.00,
    0.25,
    'other',
    'wbp-constable',
    NULL,
    NULL,
    'active',
    true
  ),

  -- PYQ 2024 Solved Questions
  (
    'a0000000-0000-0000-0000-000000000301',
    NULL,
    'wbp-polity',
    'কোন নদীকে ঐতিহাসিকভাবে ''বাংলার দুঃখ'' বলা হতো?',
    'কোন নদীকে ঐতিহাসিকভাবে ''বাংলার দুঃখ'' বলা হতো?',
    'গঙ্গা নদী',
    'দামোদর নদ',
    'তিস্তা নদী',
    'রূপনারায়ণ নদী',
    'B',
    'বিধ্বংসী বন্যার কারণে অতীতে দামোদর নদকে বাংলার দুঃখ বলা হতো।',
    'বিধ্বংসী বন্যার কারণে অতীতে দামোদর নদকে বাংলার দুঃখ বলা হতো।',
    'easy',
    1.00,
    0.25,
    'pyq',
    'wbp-constable',
    2024,
    'WBP Preliminary Question Paper 2024',
    'active',
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000302',
    NULL,
    'wbp-polity',
    'পশ্চিমবঙ্গের বর্তমান সর্বোচ্চ পর্বতশৃঙ্গ কোনটি?',
    'পশ্চিমবঙ্গের বর্তমান সর্বোচ্চ পর্বতশৃঙ্গ কোনটি?',
    'সান্দাকফু',
    'ফালুট',
    'সবরগ্রাম',
    'টাইগার হিল',
    'A',
    'সান্দাকফু (উচ্চতা ৩,৬৩৬ মিটার) হলো পশ্চিমবঙ্গ তথা সিঙ্গালীলা পর্বতমালার সর্বোচ্চ শৃঙ্গ।',
    'সান্দাকফু (উচ্চতা ৩,৬৩৬ মিটার) হলো পশ্চিমবঙ্গ তথা সিঙ্গালীলা পর্বতমালার সর্বোচ্চ শৃঙ্গ।',
    'easy',
    1.00,
    0.25,
    'pyq',
    'wbp-constable',
    2024,
    'WBP Preliminary Question Paper 2024',
    'active',
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000303',
    NULL,
    'wbp-polity',
    'স্বাধীন ভারতে প্রথম সাধারণ নির্বাচন কোন সালে অনুষ্ঠিত হয়েছিল?',
    'স্বাধীন ভারতে প্রথম সাধারণ নির্বাচন কোন সালে অনুষ্ঠিত হয়েছিল?',
    '১৯৪৭-৪৮ সালে',
    '১৯৫০-৫১ সালে',
    '১৯৫১-৫২ সালে',
    '১৯৫৫-৫৬ সালে',
    'C',
    'স্বাধীন ভারতে প্রথম সাধারণ নির্বাচন ১৯৫১-৫২ সালে অনুষ্ঠিত হয়।',
    'স্বাধীন ভারতে প্রথম সাধারণ নির্বাচন ১৯৫১-৫২ সালে অনুষ্ঠিত হয়।',
    'easy',
    1.00,
    0.25,
    'pyq',
    'wbp-constable',
    2024,
    'WBP Preliminary Question Paper 2024',
    'active',
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000304',
    NULL,
    'wbp-science',
    'বায়ুমণ্ডলের কোন স্তরে মেঘ, বৃষ্টি, কুয়াশা ইত্যাদি যাবতীয় আবহাওয়ার ঘটনা ঘটে?',
    'বায়ুমণ্ডলের কোন স্তরে মেঘ, বৃষ্টি, কুয়াশা ইত্যাদি যাবতীয় আবহাওয়ার ঘটনা ঘটে?',
    'ট্রপোস্ফিয়ার',
    'স্ট্র্যাটোস্ফিয়ার',
    'মেসোস্ফিয়ার',
    'থার্মোস্ফিয়ার',
    'A',
    'বায়ুমণ্ডলের সর্বনিম্ন স্তর ট্রপোস্ফিয়ারে যাবতীয় প্রাকৃতিক ও আবহাওয়া সংক্রান্ত ক্রিয়া-প্রতিক্রিয়া ঘটে।',
    'বায়ুমণ্ডলের সর্বনিম্ন স্তর ট্রপোস্ফিয়ারে যাবতীয় প্রাকৃতিক ও আবহাওয়া সংক্রান্ত ক্রিয়া-প্রতিক্রিয়া ঘটে।',
    'easy',
    1.00,
    0.25,
    'pyq',
    'wbp-constable',
    2024,
    'WBP Preliminary Question Paper 2024',
    'active',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  question_bengali_text = EXCLUDED.question_bengali_text,
  option_a = EXCLUDED.option_a,
  option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c,
  option_d = EXCLUDED.option_d,
  correct_option = EXCLUDED.correct_option,
  explanation = EXCLUDED.explanation,
  explanation_bengali = EXCLUDED.explanation_bengali,
  is_active = true,
  status = 'active';

-- Ensure test-wbp-mock-01 exists
INSERT INTO public.tests (id, exam_id, title, slug, test_type, duration_minutes, total_questions, total_marks, passing_marks, negative_marking, is_premium, order_index, is_active, status) VALUES
  ('test-wbp-mock-01', 'wbp-constable', 'WBP Constable Full Mock 01 (Free Starter)', 'wbp-full-mock-01', 'full_mock', 60, 5, 5.00, 2.00, 0.25, false, 4, true, 'published')
ON CONFLICT (id) DO NOTHING;

-- 4. LINK QUESTIONS TO TESTS
INSERT INTO public.test_questions (test_id, question_id, question_order, marks, negative_marks) VALUES
  -- test-indus-01 (Indus Valley)
  ('test-indus-01', 'a0000000-0000-0000-0000-000000000001', 1, 1.00, 0.25),
  ('test-indus-01', 'a0000000-0000-0000-0000-000000000002', 2, 1.00, 0.25),
  ('test-indus-01', 'a0000000-0000-0000-0000-000000000003', 3, 1.00, 0.25),
  ('test-indus-01', 'a0000000-0000-0000-0000-000000000004', 4, 1.00, 0.25),
  ('test-indus-01', 'a0000000-0000-0000-0000-000000000005', 5, 1.00, 0.25),

  -- test-wbp-full-01 / test-wbp-mock-01 (Full Mock)
  ('test-wbp-mock-01', 'a0000000-0000-0000-0000-000000000201', 1, 1.00, 0.25),
  ('test-wbp-mock-01', 'a0000000-0000-0000-0000-000000000202', 2, 1.00, 0.25),
  ('test-wbp-mock-01', 'a0000000-0000-0000-0000-000000000203', 3, 1.00, 0.25),
  ('test-wbp-mock-01', 'a0000000-0000-0000-0000-000000000204', 4, 1.00, 0.25),
  ('test-wbp-mock-01', 'a0000000-0000-0000-0000-000000000205', 5, 1.00, 0.25),

  -- test-wbp-pyq-2024 (PYQ 2024)
  ('test-wbp-pyq-2024', 'a0000000-0000-0000-0000-000000000301', 1, 1.00, 0.25),
  ('test-wbp-pyq-2024', 'a0000000-0000-0000-0000-000000000302', 2, 1.00, 0.25),
  ('test-wbp-pyq-2024', 'a0000000-0000-0000-0000-000000000303', 3, 1.00, 0.25),
  ('test-wbp-pyq-2024', 'a0000000-0000-0000-0000-000000000304', 4, 1.00, 0.25)
ON CONFLICT (test_id, question_id) DO NOTHING;
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
-- ============================================================================
-- MIGRATION 022: Add Free Plan to subscription_plans
-- Free plan for users who don't purchase any paid plan.
-- Paid plan users get access to ALL content (free + paid).
-- ============================================================================

-- Insert the Free Plan (idempotent: skip if already exists)
INSERT INTO public.subscription_plans (
    id,
    title,
    description,
    duration_days,
    price,
    original_price,
    features,
    is_active,
    order_index
) VALUES (
    'plan_free',
    'Free Plan',
    'Basic access to free practice content. Topic-wise practice tests and limited mock tests available for all aspirants.',
    36500,
    0,
    0,
    '["Topic-wise Practice Tests (Free)", "Limited Free Mock Tests", "Basic Performance Summary", "Mistakes Notebook (Last 5 Tests)", "Bengali & English Questions"]'::jsonb,
    true,
    0
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    order_index = EXCLUDED.order_index;

-- Ensure existing paid plans have higher order_index so Free Plan appears first
UPDATE public.subscription_plans
SET order_index = GREATEST(order_index, 1)
WHERE id != 'plan_free' AND order_index < 1;
-- =============================================================
-- PRACTICEKORO: MIGRATION 024 - COUPONS & DISCOUNTS SUBSYSTEM
-- =============================================================

CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    max_discount_amount NUMERIC(10, 2),
    min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    max_uses_per_user INTEGER NOT NULL DEFAULT 1,
    applicable_plan_id TEXT REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON public.coupons(valid_until);

-- Coupon Usages Audit Table
CREATE TABLE IF NOT EXISTS public.coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_id TEXT,
    order_amount NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) NOT NULL,
    final_amount NUMERIC(10, 2) NOT NULL,
    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON public.coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user_id ON public.coupon_usages(user_id);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

-- Admins can manage all coupons
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons"
    ON public.coupons
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Authenticated students can view active coupons
DROP POLICY IF EXISTS "Students can view active coupons" ON public.coupons;
CREATE POLICY "Students can view active coupons"
    ON public.coupons
    FOR SELECT
    TO authenticated
    USING (is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW()));

-- Coupon Usages Policies
DROP POLICY IF EXISTS "Admins can view all coupon usages" ON public.coupon_usages;
CREATE POLICY "Admins can view all coupon usages"
    ON public.coupon_usages
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can view their own coupon usages" ON public.coupon_usages;
CREATE POLICY "Users can view their own coupon usages"
    ON public.coupon_usages
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT SELECT, INSERT ON public.coupon_usages TO authenticated;
GRANT ALL ON public.coupons TO service_role;
GRANT ALL ON public.coupon_usages TO service_role;

-- -------------------------------------------------------------
-- RPC: Validate Coupon Code Function
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_coupon_code(
    p_code TEXT,
    p_plan_id TEXT,
    p_amount NUMERIC,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_coupon RECORD;
    v_user_uses INTEGER := 0;
    v_discount NUMERIC(10, 2) := 0;
    v_final NUMERIC(10, 2) := p_amount;
BEGIN
    -- Normalize code
    SELECT * INTO v_coupon
    FROM public.coupons
    WHERE UPPER(code) = UPPER(TRIM(p_code))
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', FALSE, 'message', 'Invalid coupon code.');
    END IF;

    IF NOT v_coupon.is_active THEN
        RETURN jsonb_build_object('valid', FALSE, 'message', 'This coupon is inactive.');
    END IF;

    IF v_coupon.valid_from > NOW() THEN
        RETURN jsonb_build_object('valid', FALSE, 'message', 'This coupon is not yet active.');
    END IF;

    IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < NOW() THEN
        RETURN jsonb_build_object('valid', FALSE, 'message', 'This coupon has expired.');
    END IF;

    IF v_coupon.applicable_plan_id IS NOT NULL AND v_coupon.applicable_plan_id != p_plan_id THEN
        RETURN jsonb_build_object('valid', FALSE, 'message', 'This coupon is not applicable for this plan.');
    END IF;

    IF p_amount < v_coupon.min_order_amount THEN
        RETURN jsonb_build_object('valid', FALSE, 'message', 'Minimum order amount for this coupon is ₹' || v_coupon.min_order_amount);
    END IF;

    IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
        RETURN jsonb_build_object('valid', FALSE, 'message', 'This coupon usage limit has been reached.');
    END IF;

    -- Check per-user usage
    IF p_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_user_uses
        FROM public.coupon_usages
        WHERE coupon_id = v_coupon.id AND user_id = p_user_id;

        IF v_user_uses >= v_coupon.max_uses_per_user THEN
            RETURN jsonb_build_object('valid', FALSE, 'message', 'You have already reached the maximum usage limit for this coupon.');
        END IF;
    END IF;

    -- Calculate discount
    IF v_coupon.discount_type = 'percentage' THEN
        v_discount := ROUND((p_amount * v_coupon.discount_value / 100.0), 2);
        IF v_coupon.max_discount_amount IS NOT NULL AND v_discount > v_coupon.max_discount_amount THEN
            v_discount := v_coupon.max_discount_amount;
        END IF;
    ELSIF v_coupon.discount_type = 'fixed' THEN
        v_discount := v_coupon.discount_value;
    END IF;

    IF v_discount > p_amount THEN
        v_discount := p_amount;
    END IF;

    v_final := p_amount - v_discount;

    RETURN jsonb_build_object(
        'valid', TRUE,
        'coupon_id', v_coupon.id,
        'code', v_coupon.code,
        'discount_type', v_coupon.discount_type,
        'discount_value', v_coupon.discount_value,
        'discount_amount', v_discount,
        'final_price', v_final,
        'message', 'Coupon applied successfully!'
    );
END;
$$;

-- -------------------------------------------------------------
-- Seed Initial Promotional Coupons
-- -------------------------------------------------------------
INSERT INTO public.coupons (
    code,
    description,
    discount_type,
    discount_value,
    max_discount_amount,
    min_order_amount,
    max_uses,
    max_uses_per_user,
    applicable_plan_id,
    valid_from,
    valid_until,
    is_active
)
VALUES
(
    'WELCOME50',
    'Special ₹50 introductory discount for new aspirants',
    'fixed',
    50.00,
    NULL,
    199.00,
    500,
    1,
    'pro_1_year',
    NOW(),
    NOW() + INTERVAL '180 days',
    TRUE
),
(
    'FESTIVE20',
    'Festive 20% discount on 1-Year All-Access Pro Pass',
    'percentage',
    20.00,
    100.00,
    299.00,
    1000,
    1,
    'pro_1_year',
    NOW(),
    NOW() + INTERVAL '90 days',
    TRUE
),
(
    'PROPASS100',
    'Special seasonal ₹100 flat off on Pro Pass',
    'fixed',
    100.00,
    NULL,
    299.00,
    250,
    1,
    'pro_1_year',
    NOW(),
    NOW() + INTERVAL '60 days',
    TRUE
)
ON CONFLICT (code) DO NOTHING;
-- ============================================================================
-- MIGRATION 025: NOTIFICATIONS SCHEDULING & AUDIENCE ALIGNMENT
-- Description: Adds scheduled_at column, auto-dispatch function, cron trigger,
--              and relaxed RLS policy for students to receive scheduled notices.
-- ============================================================================

-- 1. Add scheduled_at column if it does not already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'notifications'
          AND column_name = 'scheduled_at'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN scheduled_at TIMESTAMPTZ;
    END IF;
END $$;

-- 2. Create index for fast status & scheduled_at lookup
CREATE INDEX IF NOT EXISTS idx_notifications_status_scheduled_at
    ON public.notifications(status, scheduled_at);

-- 3. Stored procedure to transition due scheduled notifications to 'sent'
CREATE OR REPLACE FUNCTION public.process_scheduled_notifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_count integer := 0;
BEGIN
    UPDATE public.notifications
    SET status = 'sent',
        sent_at = COALESCE(scheduled_at, NOW())
    WHERE status = 'scheduled'
      AND scheduled_at IS NOT NULL
      AND scheduled_at <= NOW();

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$;

-- 4. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.process_scheduled_notifications() TO anon, authenticated, service_role;

-- 5. Optional pg_cron automated schedule (runs every minute if pg_cron is available)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    ) THEN
        -- Remove existing schedule if it was previously created
        BEGIN
            PERFORM cron.unschedule('process_scheduled_notifications_minutely');
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;

        -- Register minutely cron job
        PERFORM cron.schedule(
            'process_scheduled_notifications_minutely',
            '* * * * *',
            'SELECT public.process_scheduled_notifications();'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Non-fatal for platforms without pg_cron access
        RAISE NOTICE 'pg_cron registration skipped: %', SQLERRM;
END $$;

-- 6. Update Student RLS policy: Students can read sent notifications OR scheduled ones whose time has arrived
DROP POLICY IF EXISTS "Students can read sent notifications" ON public.notifications;

CREATE POLICY "Students can read sent notifications"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (
        status = 'sent'
        OR (
            status = 'scheduled'
            AND scheduled_at IS NOT NULL
            AND scheduled_at <= NOW()
        )
    );
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
-- ============================================================================
-- PRACTICEKORO: MIGRATION 027 - BULK STUDENT ACTIONS & REFUND AUDIT
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
-- ============================================================================
-- PRACTICEKORO: MIGRATION 027 - QUESTION IMAGES & EXAM CATEGORIES TABLE
-- ============================================================================
-- 1. Adds image_url column to public.questions for Reasoning, Geometry, Maps.
-- 2. Creates public.exam_categories table to eliminate localStorage dependency.
-- 3. Configures public read and admin write policies.
-- 4. Creates question-images storage bucket with public read.
-- ============================================================================

-- 1. Add image_url to questions table
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Create exam_categories table
CREATE TABLE IF NOT EXISTS public.exam_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed standard categories
INSERT INTO public.exam_categories (id, name, order_index)
VALUES
    ('cat_police', 'Police Exams', 1),
    ('cat_teaching', 'Teaching Exams', 2),
    ('cat_civil', 'Civil Services', 3),
    ('cat_ssc', 'SSC & Staff Selection', 4),
    ('cat_railways', 'Railways', 5),
    ('cat_defence', 'Defence', 6),
    ('cat_banking', 'Banking', 7),
    ('cat_state_govt', 'State Govt.', 8)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, order_index = EXCLUDED.order_index;

-- Populate any existing categories from public.exams table
INSERT INTO public.exam_categories (id, name, order_index)
SELECT 
    'cat_' || LOWER(REGEXP_REPLACE(category, '[^a-zA-Z0-9]+', '_', 'g')),
    category,
    10
FROM (SELECT DISTINCT category FROM public.exams WHERE category IS NOT NULL AND TRIM(category) <> '') e
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.exam_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read exam categories" ON public.exam_categories;
CREATE POLICY "Anyone can read exam categories"
    ON public.exam_categories
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage exam categories" ON public.exam_categories;
CREATE POLICY "Admins can manage exam categories"
    ON public.exam_categories
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
        OR (auth.jwt() ->> 'email') = 'admin@practicekoro.online'
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
        OR (auth.jwt() ->> 'email') = 'admin@practicekoro.online'
    );

GRANT SELECT ON public.exam_categories TO anon, authenticated;
GRANT ALL ON public.exam_categories TO authenticated, service_role;

-- 3. Storage bucket for question diagrams / images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'question-images',
    'question-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Storage policies
DROP POLICY IF EXISTS "Public can view question images" ON storage.objects;
CREATE POLICY "Public can view question images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'question-images');

DROP POLICY IF EXISTS "Admins can upload question images" ON storage.objects;
CREATE POLICY "Admins can upload question images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'question-images' AND (
            EXISTS (
                SELECT 1 FROM public.user_roles ur 
                WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
            )
            OR (auth.jwt() ->> 'email') = 'admin@practicekoro.online'
        )
    );

DROP POLICY IF EXISTS "Admins can delete question images" ON storage.objects;
CREATE POLICY "Admins can delete question images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'question-images' AND (
            EXISTS (
                SELECT 1 FROM public.user_roles ur 
                WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
            )
            OR (auth.jwt() ->> 'email') = 'admin@practicekoro.online'
        )
    );

-- 4. Update get_student_exam_questions to include imageUrl, subject, chapter
CREATE OR REPLACE FUNCTION public.get_student_exam_questions(
    p_test_id TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_has_access BOOLEAN;
    v_questions JSONB;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User authentication required' USING ERRCODE = '40100';
    END IF;

    v_has_access := public.has_test_access(v_user_id, p_test_id);
    IF NOT v_has_access THEN
        RAISE EXCEPTION 'Forbidden: Active All-Access Pro Pass required' USING ERRCODE = '40300';
    END IF;

    -- Query test questions explicitly excluding correct_option and explanations
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', q.id,
            'questionOrder', tq.question_order,
            'questionText', q.question_text,
            'questionBengaliText', q.question_bengali_text,
            'imageUrl', q.image_url,
            'subjectId', q.subject_id,
            'subjectName', s.name,
            'chapterId', q.chapter_id,
            'chapterName', c.name,
            'optionA', q.option_a,
            'optionB', q.option_b,
            'optionC', q.option_c,
            'optionD', q.option_d,
            'difficulty', q.difficulty,
            'marks', COALESCE(tq.marks, q.default_marks, 1.00),
            'negativeMarks', COALESCE(tq.negative_marks, q.default_negative_marks, 0.25)
        ) ORDER BY tq.question_order ASC
    ) INTO v_questions
    FROM public.test_questions tq
    JOIN public.questions q ON q.id = tq.question_id
    LEFT JOIN public.subjects s ON s.id = q.subject_id
    LEFT JOIN public.chapters c ON c.id = q.chapter_id
    WHERE tq.test_id = p_test_id AND q.is_active = true;

    RETURN COALESCE(v_questions, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 5. Update get_attempt_solutions to include imageUrl, subject, chapter
CREATE OR REPLACE FUNCTION public.get_attempt_solutions(
    p_attempt_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_attempt RECORD;
    v_solutions JSONB;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User authentication required' USING ERRCODE = '40100';
    END IF;

    SELECT * INTO v_attempt FROM public.test_attempts WHERE id = p_attempt_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Attempt not found' USING ERRCODE = '40400';
    END IF;

    IF v_attempt.user_id != v_user_id AND NOT public.has_role(v_user_id, 'admin') THEN
        RAISE EXCEPTION 'Forbidden: You do not own this attempt' USING ERRCODE = '40300';
    END IF;

    IF v_attempt.status != 'completed' THEN
        RAISE EXCEPTION 'Forbidden: Solutions are only available after test submission' USING ERRCODE = '40301';
    END IF;

    SELECT jsonb_agg(
        jsonb_build_object(
            'id', q.id,
            'questionOrder', tq.question_order,
            'questionText', q.question_text,
            'questionBengaliText', q.question_bengali_text,
            'imageUrl', q.image_url,
            'subjectId', q.subject_id,
            'subjectName', s.name,
            'chapterId', q.chapter_id,
            'chapterName', c.name,
            'optionA', q.option_a,
            'optionB', q.option_b,
            'optionC', q.option_c,
            'optionD', q.option_d,
            'selectedOption', aa.selected_option,
            'correctOption', q.correct_option,
            'isCorrect', COALESCE(aa.is_correct, FALSE),
            'marksAwarded', COALESCE(aa.marks_awarded, 0.00),
            'explanation', q.explanation,
            'explanationBengali', q.explanation_bengali,
            'isBookmarked', EXISTS (
                SELECT 1 FROM public.bookmarks b 
                WHERE b.user_id = v_user_id AND b.question_id = q.id
            )
        ) ORDER BY tq.question_order ASC
    ) INTO v_solutions
    FROM public.test_questions tq
    JOIN public.questions q ON q.id = tq.question_id
    LEFT JOIN public.subjects s ON s.id = q.subject_id
    LEFT JOIN public.chapters c ON c.id = q.chapter_id
    LEFT JOIN public.attempt_answers aa 
        ON aa.attempt_id = p_attempt_id AND aa.question_id = q.id
    WHERE tq.test_id = v_attempt.test_id;

    RETURN COALESCE(v_solutions, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
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
        ADD COLUMN admin_role TEXT DEFAULT NULL 
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
-- ============================================================================
-- MIGRATION 030: AUTOMATIC TEST QUESTION COUNTS AND MARKS SYNCHRONIZATION
-- ============================================================================
-- Ensures tests.total_questions and tests.total_marks stay in sync with
-- public.test_questions table whenever questions are added, removed, or
-- their assigned marks are updated.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_test_question_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_test_id TEXT;
    v_total_questions INT;
    v_total_marks NUMERIC(6,2);
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_test_id := OLD.test_id;
    ELSE
        v_test_id := NEW.test_id;
    END IF;

    -- Calculate current active questions and marks for the test
    SELECT
        COUNT(*),
        COALESCE(SUM(marks), 0.00)
    INTO
        v_total_questions,
        v_total_marks
    FROM public.test_questions
    WHERE test_id = v_test_id;

    -- Update parent test record
    UPDATE public.tests
    SET
        total_questions = v_total_questions,
        total_marks = v_total_marks,
        updated_at = NOW()
    WHERE id = v_test_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Create the trigger on public.test_questions
DROP TRIGGER IF EXISTS trg_sync_test_question_totals ON public.test_questions;

CREATE TRIGGER trg_sync_test_question_totals
AFTER INSERT OR DELETE OR UPDATE OF marks ON public.test_questions
FOR EACH ROW
EXECUTE FUNCTION public.sync_test_question_totals();

-- Recalculate and synchronize all existing tests
UPDATE public.tests t
SET
    total_questions = sub.q_count,
    total_marks = sub.marks_sum,
    updated_at = NOW()
FROM (
    SELECT
        test_id,
        COUNT(*) AS q_count,
        COALESCE(SUM(marks), 0.00) AS marks_sum
    FROM public.test_questions
    GROUP BY test_id
) sub
WHERE t.id = sub.test_id;
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
            admin_user_id,
            action,
            entity_type,
            entity_id,
            entity_name,
            details
        )
        VALUES (
            auth.uid(),
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

-- ============================================================================
-- PRACTICEKORO: MIGRATION 032 - APP SETTINGS GRANTS & ADMIN ATOMIC RPC
-- ============================================================================
GRANT ALL ON public.app_settings TO authenticated, service_role;
GRANT SELECT ON public.app_settings TO anon;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Anyone can read general settings" ON public.app_settings;
DROP POLICY IF EXISTS "Anyone can read public app settings" ON public.app_settings;
CREATE POLICY "Anyone can read public app settings"
    ON public.app_settings
    FOR SELECT
    USING (true);

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

    IF p_settings IS NULL OR jsonb_typeof(p_settings) <> 'array' THEN
        RAISE EXCEPTION 'Invalid input: p_settings must be a JSON array'
            USING ERRCODE = '22023';
    END IF;

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

INSERT INTO public.app_settings (id, category, key, value, description)
VALUES
    ('general_support_whatsapp', 'general', 'support_whatsapp', '"+91 98765 43210"'::jsonb, 'Official WhatsApp customer support helpline'),
    ('general_support_hours', 'general', 'support_hours', '"Mon - Sat: 10:00 AM - 7:00 PM (IST)"'::jsonb, 'Customer support desk operational hours'),
    ('general_support_address', 'general', 'support_address', '"West Bengal, India"'::jsonb, 'Registered operating location & jurisdiction')
ON CONFLICT (id) DO UPDATE SET
    description = EXCLUDED.description;

-- ============================================================================
-- MIGRATION 033: RESTRICT SUPER ADMIN & RESET STUDENT ROLES
-- ============================================================================

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

UPDATE public.profiles
SET 
    role = 'student',
    admin_role = NULL,
    updated_at = NOW()
WHERE LOWER(COALESCE(email, '')) <> 'admin@practicekoro.online';

UPDATE public.profiles
SET 
    role = 'admin',
    admin_role = 'super_admin',
    updated_at = NOW()
WHERE LOWER(COALESCE(email, '')) = 'admin@practicekoro.online';

DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id NOT IN (
      SELECT id FROM public.profiles 
      WHERE LOWER(COALESCE(email, '')) = 'admin@practicekoro.online'
  );

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'student'
FROM public.profiles
WHERE LOWER(COALESCE(email, '')) <> 'admin@practicekoro.online'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM public.profiles
WHERE LOWER(COALESCE(email, '')) = 'admin@practicekoro.online'
ON CONFLICT (user_id, role) DO NOTHING;

-- Hard Database Constraints:
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

-- Fail-safe Database Trigger: Prevents accidental escalation on INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.enforce_student_role_security()
RETURNS TRIGGER AS $$
BEGIN
    IF LOWER(COALESCE(NEW.email, '')) <> 'admin@practicekoro.online' THEN
        IF NEW.admin_role = 'super_admin' THEN
            RAISE EXCEPTION 'Security Policy Violation: Only admin@practicekoro.online can be Super Admin'
                USING ERRCODE = '42501';
        END IF;
    END IF;

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

    SELECT email INTO v_target_email
    FROM public.profiles
    WHERE id = p_user_id;

    IF v_target_email IS NULL THEN
        RAISE EXCEPTION 'User not found' USING ERRCODE = 'P0002';
    END IF;

    IF LOWER(v_target_email) = 'admin@practicekoro.online' THEN
        RAISE EXCEPTION 'Cannot remove or demote the primary Super Admin (admin@practicekoro.online)'
            USING ERRCODE = '42501';
    END IF;

    UPDATE public.profiles
    SET role = 'student',
        admin_role = NULL,
        updated_at = NOW()
    WHERE id = p_user_id;

    DELETE FROM public.user_roles
    WHERE user_id = p_user_id AND role = 'admin';

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


-- ============================================================================
-- PRACTICEKORO: MIGRATION 034 - FIX PAYMENT GATEWAY PERMISSIONS & ORDER CREATION
-- ============================================================================

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

    IF v_gw.key_id IS NULL OR TRIM(v_gw.key_id) = '' THEN
        SELECT trim(both '"' from value::text) INTO v_app_key_id
        FROM public.app_settings
        WHERE id = 'payment_gateway_razorpay_key_id';
    END IF;

    IF NOT FOUND AND (v_app_key_id IS NULL OR v_app_key_id = '') THEN
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

    SELECT * INTO v_existing
    FROM public.payment_gateways
    WHERE gateway = v_target;

    IF v_clean_secret = '' OR v_clean_secret LIKE '••••%' THEN
        v_final_secret := v_existing.key_secret;
    ELSE
        v_final_secret := v_clean_secret;
    END IF;

    IF v_clean_webhook = '' OR v_clean_webhook LIKE '••••%' THEN
        v_final_webhook := v_existing.webhook_secret;
    ELSE
        v_final_webhook := v_clean_webhook;
    END IF;

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

    SELECT * INTO v_plan
    FROM public.subscription_plans
    WHERE id = p_plan_id AND is_active = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Subscription plan not found or inactive' USING ERRCODE = '40400';
    END IF;

    SELECT key_id INTO v_key_id
    FROM public.payment_gateways
    WHERE gateway = 'razorpay' AND is_active = TRUE;

    IF v_key_id IS NULL OR TRIM(v_key_id) = '' THEN
        SELECT trim(both '"' from value::text) INTO v_key_id
        FROM public.app_settings
        WHERE id = 'payment_gateway_razorpay_key_id';
    END IF;

    v_order_id := 'pk_local_' || substr(md5(gen_random_uuid()::text || clock_timestamp()::text), 1, 16);

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

    SELECT * INTO v_payment
    FROM public.payments
    WHERE (order_id = p_order_id OR razorpay_order_id = p_order_id OR id::text = p_order_id)
      AND user_id = v_user_id
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        SELECT * INTO v_payment
        FROM public.payments
        WHERE user_id = v_user_id AND plan_id = p_plan_id AND status = 'pending'
        ORDER BY created_at DESC
        LIMIT 1;
    END IF;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment order not found for current user' USING ERRCODE = '40401';
    END IF;

    IF v_payment.plan_id != p_plan_id THEN
        RAISE EXCEPTION 'Mismatched subscription plan' USING ERRCODE = '40002';
    END IF;

    SELECT * INTO v_plan
    FROM public.subscription_plans
    WHERE id = p_plan_id;

    SELECT key_secret INTO v_secret
    FROM public.payment_gateways
    WHERE gateway = 'razorpay' AND is_active = TRUE;

    IF p_signature IS NOT NULL AND TRIM(p_signature) <> '' AND v_secret IS NOT NULL AND TRIM(v_secret) <> '' THEN
        v_expected_signature := encode(hmac((p_order_id || '|' || p_payment_id)::bytea, v_secret::bytea, 'sha256'), 'hex');

        IF p_signature != v_expected_signature THEN
            RAISE EXCEPTION 'Forbidden: Invalid payment signature' USING ERRCODE = '40001';
        END IF;
    END IF;

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

    IF EXISTS (
        SELECT 1 FROM public.payments
        WHERE razorpay_payment_id = p_payment_id
          AND id != v_payment.id
          AND status = 'completed'
    ) THEN
        RAISE EXCEPTION 'Duplicate payment ID already processed' USING ERRCODE = '40901';
    END IF;

    SELECT * INTO v_active_sub
    FROM public.subscriptions
    WHERE user_id = v_user_id
      AND status = 'active'
      AND expires_at > NOW()
    ORDER BY expires_at DESC
    LIMIT 1;

    IF v_active_sub.id IS NOT NULL THEN
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

GRANT EXECUTE ON FUNCTION public.admin_get_payment_gateway(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_payment_gateway(TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_razorpay_order(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_razorpay_payment(TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;


