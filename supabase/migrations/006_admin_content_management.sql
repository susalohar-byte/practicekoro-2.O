-- ============================================================================
-- PRACTICEKORO PHASE 3: ADMIN CONTENT MANAGEMENT SYSTEM
-- Content Hierarchy: Exam -> Subject -> Chapter -> Test Series -> Mock Test -> Questions
-- Status Lifecycle: draft -> published -> archived
-- ============================================================================

-- 1. EXTEND TESTS TABLE WITH STATUS COLUMN
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'tests' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.tests 
        ADD COLUMN status TEXT NOT NULL DEFAULT 'published' 
        CHECK (status IN ('draft', 'published', 'archived'));
    END IF;
END $$;

-- 2. EXTEND QUESTIONS TABLE WITH SUBJECT_ID AND STATUS
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'questions' AND column_name = 'subject_id'
    ) THEN
        ALTER TABLE public.questions 
        ADD COLUMN subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'questions' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.questions 
        ADD COLUMN status TEXT NOT NULL DEFAULT 'active' 
        CHECK (status IN ('active', 'archived', 'draft'));
    END IF;
END $$;

-- Backfill questions.subject_id from chapters if currently null
UPDATE public.questions q
SET subject_id = c.subject_id
FROM public.chapters c
WHERE q.chapter_id = c.id AND q.subject_id IS NULL;

-- 3. RLS HARDENING: Tests Visibility based on Draft vs Published
DROP POLICY IF EXISTS "Public read active tests" ON public.tests;
DROP POLICY IF EXISTS "Public read published tests" ON public.tests;
DROP POLICY IF EXISTS "Admin manage tests" ON public.tests;

-- Students and public can only read active and published tests
CREATE POLICY "Public read published tests"
ON public.tests FOR SELECT
USING (
    (is_active = true AND status = 'published') 
    OR public.has_role(auth.uid(), 'admin')
);

-- Admin can manage all tests (insert, update, delete)
CREATE POLICY "Admin manage tests"
ON public.tests FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 4. UPDATE START_TEST_ATTEMPT TO PREVENT STARTING DRAFT OR ARCHIVED TESTS
CREATE OR REPLACE FUNCTION public.start_test_attempt(
    p_test_id TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_test RECORD;
    v_has_access BOOLEAN;
    v_attempt_id UUID;
    v_start_time TIMESTAMPTZ;
    v_status TEXT;
    v_time_spent INT;
BEGIN
    -- Derive authenticated user identity
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User authentication required' USING ERRCODE = '40100';
    END IF;

    -- Validate test existence, active state, and published status (Admins can preview drafts)
    SELECT * INTO v_test 
    FROM public.tests 
    WHERE id = p_test_id 
      AND is_active = true
      AND (status = 'published' OR public.has_role(v_user_id, 'admin'));

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Test not found or unavailable' USING ERRCODE = '40400';
    END IF;

    -- Validate test access tier (Free vs. Active Subscription) server-side
    v_has_access := public.has_test_access(v_user_id, p_test_id);
    IF NOT v_has_access THEN
        RAISE EXCEPTION 'Forbidden: Active All-Access Pro Pass required' USING ERRCODE = '40300';
    END IF;

    -- Resume existing in-progress attempt if available
    SELECT id, start_time, status, time_spent_seconds 
    INTO v_attempt_id, v_start_time, v_status, v_time_spent
    FROM public.test_attempts
    WHERE user_id = v_user_id AND test_id = p_test_id AND status = 'in_progress'
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_attempt_id IS NULL THEN
        -- Initialize a new authoritative attempt record
        INSERT INTO public.test_attempts (
            user_id,
            test_id,
            status,
            start_time,
            time_spent_seconds,
            score,
            total_marks,
            correct_count,
            wrong_count,
            skipped_count,
            accuracy
        )
        VALUES (
            v_user_id,
            p_test_id,
            'in_progress',
            NOW(),
            0,
            0.00,
            v_test.total_marks,
            0,
            0,
            0,
            0.00
        )
        RETURNING id, start_time INTO v_attempt_id, v_start_time;
    END IF;

    RETURN jsonb_build_object(
        'attempt_id', v_attempt_id,
        'test_id', p_test_id,
        'start_time', v_start_time,
        'duration_minutes', v_test.duration_minutes,
        'total_questions', v_test.total_questions,
        'total_marks', v_test.total_marks,
        'negative_marking', v_test.negative_marking
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- 5. ADMIN RPC: Get Real Database Statistics for Dashboard
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_counts()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_counts JSONB;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL OR NOT public.has_role(v_user_id, 'admin') THEN
        RAISE EXCEPTION 'Forbidden: Administrator privileges required' USING ERRCODE = '40300';
    END IF;

    SELECT jsonb_build_object(
        'total_exams', (SELECT COUNT(*) FROM public.exams),
        'active_exams', (SELECT COUNT(*) FROM public.exams WHERE is_active = true),
        'total_subjects', (SELECT COUNT(*) FROM public.subjects),
        'total_chapters', (SELECT COUNT(*) FROM public.chapters),
        'total_test_series', (SELECT COUNT(*) FROM public.test_series),
        'total_tests', (SELECT COUNT(*) FROM public.tests),
        'published_tests', (SELECT COUNT(*) FROM public.tests WHERE status = 'published' AND is_active = true),
        'draft_tests', (SELECT COUNT(*) FROM public.tests WHERE status = 'draft'),
        'archived_tests', (SELECT COUNT(*) FROM public.tests WHERE status = 'archived' OR is_active = false),
        'total_questions', (SELECT COUNT(*) FROM public.questions),
        'active_questions', (SELECT COUNT(*) FROM public.questions WHERE is_active = true),
        'total_attempts', (SELECT COUNT(*) FROM public.test_attempts),
        'completed_attempts', (SELECT COUNT(*) FROM public.test_attempts WHERE status = 'completed'),
        'total_students', (SELECT COUNT(*) FROM public.profiles WHERE role = 'student')
    ) INTO v_counts;

    RETURN v_counts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- 6. ADMIN RPC: Atomically Assign & Reorder Questions in Mock Test
CREATE OR REPLACE FUNCTION public.save_test_questions(
    p_test_id TEXT,
    p_questions JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_test RECORD;
    v_item JSONB;
    v_q_id UUID;
    v_order INT := 1;
    v_marks NUMERIC(4, 2);
    v_neg_marks NUMERIC(4, 2);
    v_total_marks NUMERIC(6, 2) := 0;
    v_total_q INT := 0;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL OR NOT public.has_role(v_user_id, 'admin') THEN
        RAISE EXCEPTION 'Forbidden: Administrator privileges required' USING ERRCODE = '40300';
    END IF;

    SELECT * INTO v_test FROM public.tests WHERE id = p_test_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Test not found' USING ERRCODE = '40400';
    END IF;

    -- Delete current test_questions mapping
    DELETE FROM public.test_questions WHERE test_id = p_test_id;

    -- Insert updated ordered questions
    IF jsonb_typeof(p_questions) = 'array' THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_questions)
        LOOP
            v_q_id := (COALESCE(v_item->>'question_id', v_item->>'questionId', v_item->>'id'))::UUID;
            IF v_q_id IS NULL THEN
                CONTINUE;
            END IF;

            -- Check question exists
            IF NOT EXISTS (SELECT 1 FROM public.questions WHERE id = v_q_id) THEN
                RAISE EXCEPTION 'Question % not found in question bank', v_q_id USING ERRCODE = '40400';
            END IF;

            v_marks := COALESCE((v_item->>'marks')::NUMERIC, (v_item->>'defaultMarks')::NUMERIC, 1.00);
            v_neg_marks := COALESCE((v_item->>'negative_marks')::NUMERIC, (v_item->>'negativeMarks')::NUMERIC, v_test.negative_marking, 0.25);
            v_order := COALESCE((v_item->>'question_order')::INT, (v_item->>'questionOrder')::INT, v_total_q + 1);

            INSERT INTO public.test_questions (
                test_id,
                question_id,
                question_order,
                marks,
                negative_marks
            )
            VALUES (
                p_test_id,
                v_q_id,
                v_order,
                v_marks,
                v_neg_marks
            )
            ON CONFLICT (test_id, question_id) DO NOTHING;

            v_total_q := v_total_q + 1;
            v_total_marks := v_total_marks + v_marks;
        END LOOP;
    END IF;

    -- Sync test counts and marks
    UPDATE public.tests
    SET total_questions = v_total_q,
        total_marks = v_total_marks,
        updated_at = NOW()
    WHERE id = p_test_id;

    RETURN jsonb_build_object(
        'test_id', p_test_id,
        'total_questions', v_total_q,
        'total_marks', v_total_marks
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- 7. ADMIN RPC: Pre-Publish Validation & Publishing Test
CREATE OR REPLACE FUNCTION public.publish_test(
    p_test_id TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_test RECORD;
    v_q_count INT;
    v_invalid_q_count INT;
    v_total_marks NUMERIC(6, 2);
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL OR NOT public.has_role(v_user_id, 'admin') THEN
        RAISE EXCEPTION 'Forbidden: Administrator privileges required' USING ERRCODE = '40300';
    END IF;

    SELECT * INTO v_test FROM public.tests WHERE id = p_test_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Validation error: Mock Test not found' USING ERRCODE = '40400';
    END IF;

    -- 1. Check valid Exam
    IF v_test.exam_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.exams WHERE id = v_test.exam_id AND is_active = true) THEN
        RAISE EXCEPTION 'Validation error: Test must belong to an active Exam' USING ERRCODE = '40001';
    END IF;

    -- 2. Check Duration
    IF v_test.duration_minutes <= 0 THEN
        RAISE EXCEPTION 'Validation error: Test duration must be greater than 0 minutes' USING ERRCODE = '40002';
    END IF;

    -- 3. Check Questions count
    SELECT COUNT(*), COALESCE(SUM(marks), 0.00) 
    INTO v_q_count, v_total_marks
    FROM public.test_questions 
    WHERE test_id = p_test_id;

    IF v_q_count = 0 THEN
        RAISE EXCEPTION 'Validation error: Cannot publish test. Test must have at least 1 assigned question' USING ERRCODE = '40003';
    END IF;

    -- 4. Check for invalid questions (missing options or invalid correct_option)
    SELECT COUNT(*) INTO v_invalid_q_count
    FROM public.test_questions tq
    JOIN public.questions q ON q.id = tq.question_id
    WHERE tq.test_id = p_test_id
      AND (
          q.correct_option NOT IN ('A', 'B', 'C', 'D')
          OR q.option_a IS NULL OR TRIM(q.option_a) = ''
          OR q.option_b IS NULL OR TRIM(q.option_b) = ''
          OR q.option_c IS NULL OR TRIM(q.option_c) = ''
          OR q.option_d IS NULL OR TRIM(q.option_d) = ''
          OR q.question_text IS NULL OR TRIM(q.question_text) = ''
      );

    IF v_invalid_q_count > 0 THEN
        RAISE EXCEPTION 'Validation error: Cannot publish test. % question(s) have invalid options or missing answer keys', v_invalid_q_count USING ERRCODE = '40004';
    END IF;

    -- All checks passed: Publish the test
    UPDATE public.tests
    SET status = 'published',
        is_active = true,
        total_questions = v_q_count,
        total_marks = v_total_marks,
        updated_at = NOW()
    WHERE id = p_test_id;

    RETURN jsonb_build_object(
        'test_id', p_test_id,
        'status', 'published',
        'total_questions', v_q_count,
        'total_marks', v_total_marks,
        'message', 'Test published successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- 8. ADMIN RPC: Archive Test (Preserves attempts & results)
CREATE OR REPLACE FUNCTION public.archive_test(
    p_test_id TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL OR NOT public.has_role(v_user_id, 'admin') THEN
        RAISE EXCEPTION 'Forbidden: Administrator privileges required' USING ERRCODE = '40300';
    END IF;

    UPDATE public.tests
    SET status = 'archived',
        updated_at = NOW()
    WHERE id = p_test_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Test not found' USING ERRCODE = '40400';
    END IF;

    RETURN jsonb_build_object(
        'test_id', p_test_id,
        'status', 'archived',
        'message', 'Test archived successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
