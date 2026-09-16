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
