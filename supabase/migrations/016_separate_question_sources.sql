-- ============================================================================
-- PRACTICEKORO 2.0: MIGRATION 016 — SEPARATE QUESTION SOURCES
-- ============================================================================
-- Final question architecture:
--   1. Topic Questions     -> Subject -> Topic -> Questions (shared bank)
--   2. Full Mock Questions -> Exam -> Full Mock Test -> Questions (uploaded
--      directly into the test via test_questions; Subject/Topic OPTIONAL)
--   3. PYQ Questions       -> Exam -> Year -> Paper/Shift -> Questions
--      (uploaded directly into the PYQ test via test_questions)
--
-- No new tables are needed: the existing `questions` + `test_questions`
-- model already supports direct test-scoped uploads. This migration is
-- purely additive: indexes, uniqueness, and documentation of intent.
-- ============================================================================

-- 1. PERFORMANCE INDEXES for the three question sources
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON public.questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON public.questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_chapter_id ON public.questions(chapter_id);

-- 2. DATA VALIDATION: a global Subject (no exam) must have a unique slug so
--    duplicate "History" subjects cannot be created across upload flows.
--    (Exam-scoped subjects keep their existing UNIQUE(exam_id, slug).)
CREATE UNIQUE INDEX IF NOT EXISTS idx_subjects_slug_global
    ON public.subjects(slug)
    WHERE exam_id IS NULL;

-- 3. QUESTION SOURCING RULES (documented via comments; no destructive checks):
--
--    Topic Questions  : questions.source_type = 'topic'
--                       REQUIRE subject_id + topic_id/chapter_id
--                       (enforced in the admin Topic Questions UI)
--                       Consumed by Topic Tests via exam_topics mapping.
--
--    Full Mock & PYQ  : uploaded directly against a test row and linked via
--                       test_questions. source_type = 'pyq' for PYQ tests,
--                       'other' for full mocks. Subject/Topic OPTIONAL.
--                       They are NOT added to the topic bank automatically.
--
--    No automatic copying happens between the three sources; each upload
--    workflow creates questions in exactly one source.
--
-- 4. HISTORICAL COMPATIBILITY:
--    attempt_answers / test_questions reference questions(id); questions are
--    archived (status='archived', is_active=false), never hard-deleted, so
--    completed attempts remain immutable and renderable.
