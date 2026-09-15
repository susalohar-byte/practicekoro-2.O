-- ============================================================================
-- PRACTICEKORO 2.0: MIGRATION 014 — CANONICAL QUESTION BANK & EXAM ARCHITECTURE
-- ============================================================================
-- 1. Decouple Question Bank: Subject -> Topic -> Question (Reusable, no mandatory exam)
-- 2. Exam Architecture: Full Mock Test, PYQ, and Topic Tests
-- 3. Exam-Topic Mapping: Many-to-Many via exam_topics
-- 4. PYQ Metadata: Year, Paper, Shift support on Tests and Questions
-- ============================================================================

-- 1. EXAM-TOPIC MAPPING (Many-to-Many junction between Exams and Topics/Chapters)
CREATE TABLE IF NOT EXISTS public.exam_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id TEXT NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    topic_id TEXT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(exam_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_exam_topics_exam_id ON public.exam_topics(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_topics_topic_id ON public.exam_topics(topic_id);

-- RLS for exam_topics
ALTER TABLE public.exam_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view exam_topics" ON public.exam_topics;
CREATE POLICY "Anyone can view exam_topics"
    ON public.exam_topics
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can manage exam_topics" ON public.exam_topics;
CREATE POLICY "Admins can manage exam_topics"
    ON public.exam_topics
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.exam_topics TO anon, authenticated;
GRANT ALL ON public.exam_topics TO service_role;

-- 2. OPTIONAL TOPIC HIERARCHY SUPPORT (parent_id on chapters)
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS parent_id TEXT REFERENCES public.chapters(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_chapters_parent_id ON public.chapters(parent_id);

-- 3. EXTEND QUESTIONS WITH CANONICAL QUESTION BANK METADATA
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS topic_id TEXT REFERENCES public.chapters(id) ON DELETE SET NULL;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'mcq';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'topic' CHECK (source_type IN ('topic', 'pyq', 'other'));
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS source_year INT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS source_exam TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS source_paper TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS source_shift TEXT;

-- Backfill questions.topic_id from chapter_id
UPDATE public.questions
SET topic_id = chapter_id
WHERE topic_id IS NULL AND chapter_id IS NOT NULL;

-- Trigger to keep chapter_id and topic_id in sync bidirectionally
CREATE OR REPLACE FUNCTION public.sync_question_topic_chapter()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.topic_id IS NOT NULL AND NEW.chapter_id IS NULL THEN
        NEW.chapter_id := NEW.topic_id;
    ELSIF NEW.chapter_id IS NOT NULL AND NEW.topic_id IS NULL THEN
        NEW.topic_id := NEW.chapter_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_question_topic_chapter ON public.questions;
CREATE TRIGGER trg_sync_question_topic_chapter
BEFORE INSERT OR UPDATE OF topic_id, chapter_id ON public.questions
FOR EACH ROW EXECUTE FUNCTION public.sync_question_topic_chapter();

-- 4. EXTEND TESTS WITH PYQ / EXAM PATTERN METADATA
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS paper_name TEXT;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS shift TEXT;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS set_name TEXT;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS exam_date DATE;

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON public.questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_source_type ON public.questions(source_type);
CREATE INDEX IF NOT EXISTS idx_questions_source_year ON public.questions(source_year);
CREATE INDEX IF NOT EXISTS idx_tests_year ON public.tests(year);
CREATE INDEX IF NOT EXISTS idx_tests_test_type ON public.tests(test_type);

-- 6. BACKFILL INITIAL EXAM-TOPIC MAPPINGS (Preserve existing relationships)
-- Map chapters to exams where tests already exist
INSERT INTO public.exam_topics (exam_id, topic_id, order_index)
SELECT DISTINCT t.exam_id, t.chapter_id, 0
FROM public.tests t
WHERE t.exam_id IS NOT NULL AND t.chapter_id IS NOT NULL
ON CONFLICT (exam_id, topic_id) DO NOTHING;

-- Also seed all current chapters to 'wbp-constable' so students immediately have topic access
INSERT INTO public.exam_topics (exam_id, topic_id, order_index)
SELECT 'wbp-constable', c.id, c.order_index
FROM public.chapters c
ON CONFLICT (exam_id, topic_id) DO NOTHING;
