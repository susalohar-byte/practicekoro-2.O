-- ============================================================================
-- PRACTICEKORO 2.0: MIGRATION 011 - MAKE SUBJECT EXAM_ID OPTIONAL
-- Purpose: Allow subjects to be created as universal/global subjects without
--          requiring a specific target exam to be filled.
-- ============================================================================

ALTER TABLE public.subjects ALTER COLUMN exam_id DROP NOT NULL;
