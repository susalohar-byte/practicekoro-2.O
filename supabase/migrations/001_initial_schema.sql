-- ============================================================================
-- PRACTICEKORO PRODUCTION DATABASE SCHEMA (PHASE 1)
-- Normalized architecture for Exam -> Subject -> Chapter -> Mock Test -> Questions
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USER PROFILES (Linked 1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT 'Aspirant',
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    target_exam_id TEXT, -- soft ref to exams(id)
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'instructor')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. USER ROLES (For clean multi-role & RBAC)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'instructor')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 3. EXAMS (Top level: WBP Constable, Kolkata Police SI, WBCS, etc.)
CREATE TABLE IF NOT EXISTS public.exams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'State Govt.', -- Police, State Govt, Teaching, etc.
    icon_name TEXT NOT NULL DEFAULT 'Shield',
    banner_url TEXT,
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SUBJECTS (Belongs to an Exam: Indian History, General Science, etc.)
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    icon_name TEXT NOT NULL DEFAULT 'BookOpen',
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(exam_id, slug)
);

-- 5. CHAPTERS (Belongs to a Subject: Indus Valley, Vedic Era, Percentage, etc.)
CREATE TABLE IF NOT EXISTS public.chapters (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(subject_id, slug)
);

-- 6. TEST SERIES (Optional thematic bundles under an exam)
CREATE TABLE IF NOT EXISTS public.test_series (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TESTS (Mock Tests: Chapter Mock, Full Mock, Subject Mock, PYQ)
CREATE TABLE IF NOT EXISTS public.tests (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
    chapter_id TEXT REFERENCES public.chapters(id) ON DELETE SET NULL,
    test_series_id TEXT REFERENCES public.test_series(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    test_type TEXT NOT NULL DEFAULT 'chapter_mock' CHECK (test_type IN ('chapter_mock', 'full_mock', 'subject_mock', 'pyq')),
    duration_minutes INT NOT NULL DEFAULT 60,
    total_questions INT NOT NULL DEFAULT 0,
    total_marks NUMERIC(6, 2) NOT NULL DEFAULT 50.00,
    passing_marks NUMERIC(6, 2) NOT NULL DEFAULT 20.00,
    negative_marking NUMERIC(4, 2) NOT NULL DEFAULT 0.25,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE, -- Free vs Premium Mock Test
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. QUESTIONS (Normalized question bank)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id TEXT REFERENCES public.chapters(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL,
    question_bengali_text TEXT,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option VARCHAR(2) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    explanation_bengali TEXT,
    difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    default_marks NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    default_negative_marks NUMERIC(4, 2) NOT NULL DEFAULT 0.25,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TEST_QUESTIONS (Junction linking questions to specific mock tests with order & custom marks)
CREATE TABLE IF NOT EXISTS public.test_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id TEXT NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    question_order INT NOT NULL,
    marks NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    negative_marks NUMERIC(4, 2) NOT NULL DEFAULT 0.25,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(test_id, question_id),
    UNIQUE(test_id, question_order)
);

-- 10. SUBSCRIPTION PLANS (Commercial All-Access Passes)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id TEXT PRIMARY KEY, -- e.g. 'pass_1_year', 'pass_6_month'
    title TEXT NOT NULL,
    description TEXT,
    duration_days INT NOT NULL DEFAULT 365,
    price NUMERIC(8, 2) NOT NULL,
    original_price NUMERIC(8, 2),
    features JSONB NOT NULL DEFAULT '["Access to ALL Premium Mock Tests", "Detailed Performance Analytics", "Mistakes Notebook & Revision"]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PAYMENTS (Gateway transaction records)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(8, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    gateway TEXT NOT NULL DEFAULT 'razorpay',
    transaction_id TEXT,
    order_id TEXT,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. SUBSCRIPTIONS (User active subscriptions)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES public.subscription_plans(id),
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. TEST ATTEMPTS (Student exam/practice sessions)
CREATE TABLE IF NOT EXISTS public.test_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    test_id TEXT NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    time_spent_seconds INT NOT NULL DEFAULT 0,
    score NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    total_marks NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    correct_count INT NOT NULL DEFAULT 0,
    wrong_count INT NOT NULL DEFAULT 0,
    skipped_count INT NOT NULL DEFAULT 0,
    accuracy NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    rank INT,
    percentile NUMERIC(5, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. ATTEMPT ANSWERS (Individual question responses in an attempt)
CREATE TABLE IF NOT EXISTS public.attempt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option VARCHAR(2) CHECK (selected_option IN ('A', 'B', 'C', 'D', NULL)),
    is_correct BOOLEAN DEFAULT FALSE,
    marks_awarded NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
    time_spent_seconds INT NOT NULL DEFAULT 0,
    is_marked_for_review BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(attempt_id, question_id)
);

-- 15. TEST RESULTS (Persisted final graded result)
CREATE TABLE IF NOT EXISTS public.test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    test_id TEXT NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    score NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    total_marks NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    accuracy NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    rank INT,
    total_candidates INT DEFAULT 1,
    percentile NUMERIC(5, 2) DEFAULT 0.00,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. MISTAKES NOTEBOOK (Wrong answers automatically aggregated for revision)
CREATE TABLE IF NOT EXISTS public.mistakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    last_attempt_id UUID REFERENCES public.test_attempts(id) ON DELETE SET NULL,
    wrong_count INT NOT NULL DEFAULT 1,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- 17. BOOKMARKS (Student saved questions)
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- 18. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_subjects_exam ON public.subjects(exam_id);
CREATE INDEX IF NOT EXISTS idx_chapters_subject ON public.chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_tests_chapter ON public.tests(chapter_id);
CREATE INDEX IF NOT EXISTS idx_tests_exam ON public.tests(exam_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_test ON public.test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON public.test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_test ON public.test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt ON public.attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_user ON public.mistakes(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id, status);

-- Trigger: Automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_exams_updated_at
BEFORE UPDATE ON public.exams
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_tests_updated_at
BEFORE UPDATE ON public.tests
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
