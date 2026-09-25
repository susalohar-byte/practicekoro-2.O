-- ============================================================================
-- Migration 042: Restore subjects and chapters in student RPC payloads
-- ============================================================================
-- Migration 040 added 'imageUrl' to student RPCs but inadvertently omitted
-- 'subjectId', 'subjectName', 'chapterId', and 'chapterName' alongside their
-- joins to public.subjects and public.chapters.
--
-- This migration restores those fields to both:
--   1. get_student_exam_questions  (live TestRunner questions)
--   2. get_attempt_solutions        (TestSolutions review)
--
-- This guarantees that the live TestRunner and Solutions views always receive
-- accurate subject names (e.g. General Awareness, Elementary Mathematics,
-- Reasoning) rather than falling back to default placeholders.
-- ============================================================================

-- 1. Live runner questions: expose subject and chapter metadata
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

-- 2. Solutions review: expose subject and chapter metadata
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
