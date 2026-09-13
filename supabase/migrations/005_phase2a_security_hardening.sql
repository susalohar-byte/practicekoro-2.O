-- ============================================================================
-- PRACTICEKORO PHASE 2A: SECURITY HARDENING & PRODUCTION AUDIT MIGRATION
-- 1. Derive user identity strictly from auth.uid() (no client-supplied user_id)
-- 2. Anti-leak: active exam runner never receives correct_option or explanations
-- 3. Server-authoritative grading based on test_questions junction
-- 4. Timer expiry validation and submission idempotency
-- 5. Real-time ranking calculation (no hardcoded fake rank / percentile)
-- 6. RLS tightening against direct client tampering
-- ============================================================================

-- Add percentage column to test_results if not present
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'test_results' AND column_name = 'percentage'
    ) THEN
        ALTER TABLE public.test_results ADD COLUMN percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 1. SECURE RPC: Start or Resume a Test Attempt (auth.uid() strictly enforced)
-- ----------------------------------------------------------------------------
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

    -- Validate test existence and active status
    SELECT * INTO v_test FROM public.tests WHERE id = p_test_id AND is_active = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Test not found or inactive' USING ERRCODE = '40400';
    END IF;

    -- Validate test access tier (Free vs. Active Subscription) server-side
    v_has_access := public.has_test_access(v_user_id, p_test_id);
    IF NOT v_has_access THEN
        RAISE EXCEPTION 'Forbidden: Active All-Access Pro Pass required' USING ERRCODE = '40300';
    END IF;

    -- Check for an existing in_progress attempt for this user & test
    SELECT id, start_time, status, time_spent_seconds 
    INTO v_attempt_id, v_start_time, v_status, v_time_spent
    FROM public.test_attempts
    WHERE user_id = v_user_id AND test_id = p_test_id AND status = 'in_progress'
    ORDER BY created_at DESC LIMIT 1;

    -- If no in_progress attempt exists, create a new one
    IF v_attempt_id IS NULL THEN
        INSERT INTO public.test_attempts (
            user_id,
            test_id,
            status,
            start_time,
            total_marks,
            time_spent_seconds
        )
        VALUES (
            v_user_id,
            p_test_id,
            'in_progress',
            NOW(),
            v_test.total_marks,
            0
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


-- ----------------------------------------------------------------------------
-- 2. SECURE RPC: Get Sanitized Exam Questions (Anti-Cheat: NO answers exposed)
-- ----------------------------------------------------------------------------
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
            'negativeMarks', COALESCE(tq.negative_marks, q.default_negative_marks, 0.25)
        ) ORDER BY tq.question_order ASC
    ) INTO v_questions
    FROM public.test_questions tq
    JOIN public.questions q ON q.id = tq.question_id
    WHERE tq.test_id = p_test_id AND q.is_active = true;

    RETURN COALESCE(v_questions, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- ----------------------------------------------------------------------------
-- 3. SECURE RPC: Autosave Answers with Ownership & Expiry Checks
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.save_test_answers(
    p_attempt_id UUID,
    p_answers JSONB,
    p_time_spent_seconds INT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_attempt RECORD;
    v_test RECORD;
    v_expiry_time TIMESTAMPTZ;
    v_item JSONB;
    v_q_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Verify attempt exists, belongs to caller, and is currently in progress
    SELECT * INTO v_attempt FROM public.test_attempts
    WHERE id = p_attempt_id AND user_id = v_user_id AND status = 'in_progress';
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    SELECT * INTO v_test FROM public.tests WHERE id = v_attempt.test_id;

    -- Validate timer has not completely expired (allow 3 min grace period for network delays)
    v_expiry_time := v_attempt.start_time + (v_test.duration_minutes || ' minutes')::INTERVAL + INTERVAL '3 minutes';
    IF NOW() > v_expiry_time THEN
        RETURN FALSE;
    END IF;

    -- Update time spent
    UPDATE public.test_attempts
    SET time_spent_seconds = p_time_spent_seconds
    WHERE id = p_attempt_id;

    -- Save/update student selections
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_answers)
    LOOP
        v_q_id := (v_item->>'questionId')::UUID;
        IF v_q_id IS NULL THEN
            v_q_id := (v_item->>'question_id')::UUID;
        END IF;

        -- Verify question actually belongs to this test
        IF EXISTS (
            SELECT 1 FROM public.test_questions 
            WHERE test_id = v_attempt.test_id AND question_id = v_q_id
        ) THEN
            INSERT INTO public.attempt_answers (
                attempt_id,
                question_id,
                selected_option,
                is_marked_for_review,
                time_spent_seconds
            )
            VALUES (
                p_attempt_id,
                v_q_id,
                COALESCE(v_item->>'selectedOption', v_item->>'selected_option'),
                COALESCE((v_item->>'isMarkedForReview')::BOOLEAN, (v_item->>'is_marked_for_review')::BOOLEAN, FALSE),
                COALESCE((v_item->>'timeSpentSeconds')::INT, (v_item->>'time_spent_seconds')::INT, 0)
            )
            ON CONFLICT (attempt_id, question_id) DO UPDATE SET
                selected_option = EXCLUDED.selected_option,
                is_marked_for_review = EXCLUDED.is_marked_for_review,
                time_spent_seconds = EXCLUDED.time_spent_seconds;
        END IF;
    END LOOP;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- ----------------------------------------------------------------------------
-- 4. SECURE RPC: Server-Authoritative Submission, Idempotency & Live Ranking
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_test_attempt(
    p_attempt_id UUID,
    p_answers JSONB,
    p_time_spent_seconds INT
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_attempt RECORD;
    v_test RECORD;
    v_q RECORD;
    v_selected TEXT;
    
    v_correct_count INT := 0;
    v_wrong_count INT := 0;
    v_skipped_count INT := 0;
    v_score NUMERIC(6, 2) := 0.00;
    v_accuracy NUMERIC(5, 2) := 0.00;
    v_percentage NUMERIC(5, 2) := 0.00;
    v_passed BOOLEAN := FALSE;
    
    v_rank INT;
    v_total_candidates INT;
    v_percentile NUMERIC(5, 2);
    v_existing_result RECORD;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User authentication required' USING ERRCODE = '40100';
    END IF;

    -- Verify attempt and strict ownership
    SELECT * INTO v_attempt FROM public.test_attempts WHERE id = p_attempt_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Attempt not found' USING ERRCODE = '40400';
    END IF;

    IF v_attempt.user_id != v_user_id THEN
        RAISE EXCEPTION 'Forbidden: You do not own this attempt' USING ERRCODE = '40300';
    END IF;

    -- SUBMISSION IDEMPOTENCY: If already completed, return existing graded results immediately
    IF v_attempt.status = 'completed' THEN
        SELECT * INTO v_existing_result FROM public.test_results WHERE attempt_id = p_attempt_id;
        IF FOUND THEN
            RETURN jsonb_build_object(
                'attempt_id', p_attempt_id,
                'test_id', v_attempt.test_id,
                'score', v_existing_result.score,
                'total_marks', v_existing_result.total_marks,
                'percentage', v_existing_result.percentage,
                'accuracy', v_existing_result.accuracy,
                'correct_count', v_attempt.correct_count,
                'wrong_count', v_attempt.wrong_count,
                'skipped_count', v_attempt.skipped_count,
                'time_spent_seconds', v_attempt.time_spent_seconds,
                'rank', v_existing_result.rank,
                'total_candidates', v_existing_result.total_candidates,
                'percentile', v_existing_result.percentile,
                'passed', v_existing_result.passed
            );
        END IF;
    END IF;

    SELECT * INTO v_test FROM public.tests WHERE id = v_attempt.test_id;

    -- Iterate strictly over AUTHORITATIVE test_questions for this test
    -- Client cannot inject arbitrary external question IDs
    FOR v_q IN 
        SELECT 
            tq.question_id,
            tq.question_order,
            COALESCE(tq.marks, q.default_marks, 1.00) AS marks,
            COALESCE(tq.negative_marks, q.default_negative_marks, 0.25) AS negative_marks,
            q.correct_option
        FROM public.test_questions tq
        JOIN public.questions q ON q.id = tq.question_id
        WHERE tq.test_id = v_test.id AND q.is_active = true
        ORDER BY tq.question_order ASC
    LOOP
        -- Look up student's selected answer from p_answers payload
        SELECT COALESCE(elem->>'selectedOption', elem->>'selected_option')
        INTO v_selected
        FROM jsonb_array_elements(p_answers) elem
        WHERE (COALESCE(elem->>'questionId', elem->>'question_id'))::UUID = v_q.question_id
        LIMIT 1;

        IF v_selected IS NULL OR v_selected = '' THEN
            -- Unanswered / Skipped
            v_skipped_count := v_skipped_count + 1;

            INSERT INTO public.attempt_answers (
                attempt_id, question_id, selected_option, is_correct, marks_awarded, time_spent_seconds
            )
            VALUES (
                p_attempt_id, v_q.question_id, NULL, FALSE, 0.00, 0
            )
            ON CONFLICT (attempt_id, question_id) DO UPDATE SET
                selected_option = NULL,
                is_correct = FALSE,
                marks_awarded = 0.00;

        ELSIF v_selected = v_q.correct_option THEN
            -- Correct Answer
            v_correct_count := v_correct_count + 1;
            v_score := v_score + v_q.marks;

            INSERT INTO public.attempt_answers (
                attempt_id, question_id, selected_option, is_correct, marks_awarded, time_spent_seconds
            )
            VALUES (
                p_attempt_id, v_q.question_id, v_selected, TRUE, v_q.marks, 0
            )
            ON CONFLICT (attempt_id, question_id) DO UPDATE SET
                selected_option = v_selected,
                is_correct = TRUE,
                marks_awarded = v_q.marks;

        ELSE
            -- Wrong Answer: Deduct negative marks
            v_wrong_count := v_wrong_count + 1;
            v_score := v_score - v_q.negative_marks;

            INSERT INTO public.attempt_answers (
                attempt_id, question_id, selected_option, is_correct, marks_awarded, time_spent_seconds
            )
            VALUES (
                p_attempt_id, v_q.question_id, v_selected, FALSE, -v_q.negative_marks, 0
            )
            ON CONFLICT (attempt_id, question_id) DO UPDATE SET
                selected_option = v_selected,
                is_correct = FALSE,
                marks_awarded = -v_q.negative_marks;

            -- AUTOMATED MISTAKES NOTEBOOK INTEGRATION (Idempotent per test attempt)
            INSERT INTO public.mistakes (
                user_id, question_id, last_attempt_id, wrong_count, is_resolved
            )
            VALUES (
                v_user_id, v_q.question_id, p_attempt_id, 1, FALSE
            )
            ON CONFLICT (user_id, question_id) DO UPDATE SET
                wrong_count = CASE 
                    WHEN public.mistakes.last_attempt_id = p_attempt_id THEN public.mistakes.wrong_count 
                    ELSE public.mistakes.wrong_count + 1 
                END,
                last_attempt_id = p_attempt_id,
                is_resolved = FALSE,
                updated_at = NOW();
        END IF;
    END LOOP;

    -- Clamp minimum score to 0.00
    v_score := GREATEST(0.00, v_score);

    -- Mathematically distinct metrics:
    -- Accuracy: correct / attempted * 100
    IF (v_correct_count + v_wrong_count) > 0 THEN
        v_accuracy := ROUND(((v_correct_count::NUMERIC / (v_correct_count + v_wrong_count)) * 100), 2);
    ELSE
        v_accuracy := 0.00;
    END IF;

    -- Percentage: score / total_marks * 100
    IF v_test.total_marks > 0 THEN
        v_percentage := ROUND(((v_score / v_test.total_marks) * 100), 2);
    ELSE
        v_percentage := 0.00;
    END IF;

    IF v_score >= v_test.passing_marks THEN
        v_passed := TRUE;
    END IF;

    -- REAL-TIME COMPETITIVE RANK & PERCENTILE CALCULATION (No hardcoded values)
    SELECT COUNT(*) + 1 INTO v_rank 
    FROM public.test_results 
    WHERE test_id = v_attempt.test_id AND score > v_score;

    SELECT COUNT(*) + 1 INTO v_total_candidates 
    FROM public.test_results 
    WHERE test_id = v_attempt.test_id;

    IF v_total_candidates > 1 THEN
        v_percentile := ROUND((((v_total_candidates - v_rank)::NUMERIC / v_total_candidates) * 100), 2);
    ELSE
        v_percentile := 100.00;
    END IF;

    -- Complete the attempt record (Immutable after completion)
    UPDATE public.test_attempts
    SET status = 'completed',
        end_time = NOW(),
        time_spent_seconds = p_time_spent_seconds,
        score = v_score,
        correct_count = v_correct_count,
        wrong_count = v_wrong_count,
        skipped_count = v_skipped_count,
        accuracy = v_accuracy,
        rank = v_rank,
        percentile = v_percentile
    WHERE id = p_attempt_id;

    -- Upsert final test_results
    INSERT INTO public.test_results (
        attempt_id,
        user_id,
        test_id,
        score,
        total_marks,
        percentage,
        accuracy,
        rank,
        total_candidates,
        percentile,
        passed
    )
    VALUES (
        p_attempt_id,
        v_user_id,
        v_attempt.test_id,
        v_score,
        v_test.total_marks,
        v_percentage,
        v_accuracy,
        v_rank,
        v_total_candidates,
        v_percentile,
        v_passed
    )
    ON CONFLICT (attempt_id) DO UPDATE SET
        score = EXCLUDED.score,
        percentage = EXCLUDED.percentage,
        accuracy = EXCLUDED.accuracy,
        rank = EXCLUDED.rank,
        total_candidates = EXCLUDED.total_candidates,
        percentile = EXCLUDED.percentile,
        passed = EXCLUDED.passed;

    RETURN jsonb_build_object(
        'attempt_id', p_attempt_id,
        'test_id', v_attempt.test_id,
        'score', v_score,
        'total_marks', v_test.total_marks,
        'percentage', v_percentage,
        'accuracy', v_accuracy,
        'correct_count', v_correct_count,
        'wrong_count', v_wrong_count,
        'skipped_count', v_skipped_count,
        'time_spent_seconds', p_time_spent_seconds,
        'rank', v_rank,
        'total_candidates', v_total_candidates,
        'percentile', v_percentile,
        'passed', v_passed
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- ----------------------------------------------------------------------------
-- 5. SECURE RPC: Post-Exam Solutions (Only viewable on completed attempts)
-- ----------------------------------------------------------------------------
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


-- ----------------------------------------------------------------------------
-- 6. RLS TIGHTENING: Prevent Direct Student Modification of Attempts & Results
-- ----------------------------------------------------------------------------
-- Drop permissive manage policies that allowed arbitrary direct updates
DROP POLICY IF EXISTS "Users manage own test attempts" ON public.test_attempts;
DROP POLICY IF EXISTS "Users manage own attempt answers" ON public.attempt_answers;
DROP POLICY IF EXISTS "Users or engine insert test results" ON public.test_results;

-- Test Attempts: Students can read their own attempts; insertion/update only via RPCs
CREATE POLICY "Users read own test attempts"
ON public.test_attempts FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin manage test attempts"
ON public.test_attempts FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Attempt Answers: Students can read their own attempt answers; writes go through RPCs
CREATE POLICY "Users read own attempt answers"
ON public.attempt_answers FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.test_attempts
        WHERE id = attempt_answers.attempt_id
          AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
);

CREATE POLICY "Admin manage attempt answers"
ON public.attempt_answers FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Test Results: Read-only for students; writes go through submit_test_attempt RPC
CREATE POLICY "Users read own test results"
ON public.test_results FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin manage test results"
ON public.test_results FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Questions table: restrict direct SELECT to admins only, preventing answer scraping
DROP POLICY IF EXISTS "Questions readable by authenticated users" ON public.questions;
CREATE POLICY "Questions readable by admins only"
ON public.questions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
