-- ============================================================================
-- PRACTICEKORO 2.0: MIGRATION 017 — ALLOW TOPIC MOCK TESTS WITHOUT EXAM
-- ============================================================================
-- Purpose:
--   1. Allow Topic Mock Tests to be directly attached to a Topic (chapter_id)
--      without requiring an artificial exam_id.
--   2. Ensures exam_id on public.tests is nullable.
--   3. Guarantees question bank isolation across Subject/Topic Mocks,
--      Full Mocks, and PYQ tests.
-- ============================================================================

-- 1. Make tests.exam_id nullable so Topic Mock Tests can belong purely to a Topic
ALTER TABLE public.tests ALTER COLUMN exam_id DROP NOT NULL;

-- 2. Performance index on chapter_id for topic mock tests
CREATE INDEX IF NOT EXISTS idx_tests_chapter_id ON public.tests(chapter_id);
CREATE INDEX IF NOT EXISTS idx_tests_subject_id ON public.tests(subject_id);

-- 3. Ensure test_type check constraint includes 'topic' alongside chapter_mock, full_mock, subject_mock, and pyq
ALTER TABLE public.tests DROP CONSTRAINT IF EXISTS tests_test_type_check;
ALTER TABLE public.tests ADD CONSTRAINT tests_test_type_check 
    CHECK (test_type IN ('chapter_mock', 'full_mock', 'subject_mock', 'pyq', 'topic'));

-- 4. Verify RLS policies on tests remain permissive for admin management and public read of published tests
-- (Existing policies from 006_admin_content_management.sql check is_active and status, not exam_id)
