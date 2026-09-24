-- ============================================================================
-- Migration 040: include question images in student RPC payloads (PYQ)
-- ============================================================================
-- PYQ papers (e.g. WBP Constable 2025) carry diagram-based questions whose
-- artwork lives in the existing public.questions.image_url column (no schema
-- change). The two student-facing RPCs never selected that column, so PYQ
-- images could never reach the student test runner or solutions view:
--
--   1. get_student_exam_questions  (live TestRunner questions)
--   2. get_attempt_solutions        (TestSolutions review)
--
-- This migration adds `'imageUrl', q.image_url` to both jsonb payloads.
-- Client rendering stays null-safe: no image_url means no <img> element,
-- so non-PYQ/topic/mock questions render exactly as before.
--
-- Apply with: scripts/apply-migrations-prod.sh (or supabase db push)
-- ============================================================================

-- 1. Live runner questions: expose the diagram URL (NULL when absent).
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
            'optionA', q.option_a,
            'optionB', q.option_b,
            'optionC', q.option_c,
            'optionD', q.option_d,
            'difficulty', q.difficulty,
            'marks', COALESCE(tq.marks, q.default_marks, 1.00),
            'negativeMarks', COALESCE(tq.negative_marks, q.default_negative_marks, 0.25),
            'imageUrl', q.image_url
        ) ORDER BY tq.question_order ASC
    ) INTO v_questions
    FROM public.test_questions tq
    JOIN public.questions q ON q.id = tq.question_id
    WHERE tq.test_id = p_test_id AND q.is_active = true;

    RETURN COALESCE(v_questions, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 2. Solutions review: expose the diagram URL (NULL when absent).
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

    -- Verify attempt exists, belongs to caller, and is COMPLETED
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
    LEFT JOIN public.attempt_answers aa 
        ON aa.attempt_id = p_attempt_id AND aa.question_id = q.id
    WHERE tq.test_id = v_attempt.test_id;

    RETURN COALESCE(v_solutions, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
