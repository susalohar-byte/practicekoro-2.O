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
