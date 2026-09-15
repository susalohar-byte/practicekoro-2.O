-- ============================================================================
-- PRACTICEKORO 2.0: MIGRATION 010 - REMOVE QUESTION DIFFICULTY CONSTRAINT
-- Purpose: Completely remove mandatory difficulty constraint on questions table
--          so questions can be uploaded and created without difficulty levels.
-- ============================================================================

-- 1. Drop the NOT NULL constraint from questions.difficulty
ALTER TABLE public.questions ALTER COLUMN difficulty DROP NOT NULL;

-- 2. Drop the CHECK constraint questions_difficulty_check if it exists
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_difficulty_check;

-- 3. Set default to NULL
ALTER TABLE public.questions ALTER COLUMN difficulty SET DEFAULT NULL;

COMMENT ON COLUMN public.questions.difficulty IS 'Legacy difficulty level (deprecated: questions are no longer categorized by difficulty).';
