-- 009_test_types_and_associations.sql
-- Adds year column to tests, expands test_type to include 'topic',
-- creates test_exams junction table for reusable topic tests across multiple exams.

-- 1. Ensure is_admin helper exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.has_role(auth.uid(), 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add year column to tests if not exists
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS year INT;

-- 3. Update test_type check constraint to include 'topic'
ALTER TABLE public.tests DROP CONSTRAINT IF EXISTS tests_test_type_check;
ALTER TABLE public.tests ADD CONSTRAINT tests_test_type_check 
    CHECK (test_type IN ('chapter_mock', 'full_mock', 'subject_mock', 'pyq', 'topic'));

-- 4. Create test_exams junction table
CREATE TABLE IF NOT EXISTS public.test_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id TEXT NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    exam_id TEXT NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (test_id, exam_id)
);

CREATE INDEX IF NOT EXISTS idx_test_exams_test_id ON public.test_exams(test_id);
CREATE INDEX IF NOT EXISTS idx_test_exams_exam_id ON public.test_exams(exam_id);

-- 5. Enable RLS and setup policies
ALTER TABLE public.test_exams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view test_exams" ON public.test_exams;
CREATE POLICY "Anyone can view test_exams"
    ON public.test_exams
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can manage test_exams" ON public.test_exams;
CREATE POLICY "Admins can manage test_exams"
    ON public.test_exams
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Grant permissions
GRANT SELECT ON public.test_exams TO anon, authenticated;
GRANT ALL ON public.test_exams TO service_role;

-- 7. Backfill test_exams from existing tests
INSERT INTO public.test_exams (test_id, exam_id)
SELECT id, exam_id FROM public.tests WHERE exam_id IS NOT NULL
ON CONFLICT (test_id, exam_id) DO NOTHING;

-- 8. Associate test-indus-01 with both wbp-constable and kp-police-si
INSERT INTO public.test_exams (test_id, exam_id)
VALUES ('test-indus-01', 'kp-police-si')
ON CONFLICT (test_id, exam_id) DO NOTHING;

-- 9. Seed a representative PYQ test if not exists
INSERT INTO public.tests (
    id, exam_id, title, slug, description, test_type, year,
    duration_minutes, total_questions, total_marks, passing_marks,
    negative_marking, is_premium, order_index, is_active, status
)
VALUES (
    'test-wbp-pyq-2024',
    'wbp-constable',
    'WBP Constable 2024 Prelims Official Paper',
    'wbp-constable-2024-prelims',
    'Official Previous Year Question paper from 2024 exam with comprehensive solutions and analysis.',
    'pyq',
    2024,
    60,
    5,
    5.00,
    2.00,
    0.25,
    false,
    1,
    true,
    'published'
)
ON CONFLICT (id) DO UPDATE SET
    year = 2024,
    test_type = 'pyq';

-- Associate test-wbp-pyq-2024 with wbp-constable in test_exams
INSERT INTO public.test_exams (test_id, exam_id)
VALUES ('test-wbp-pyq-2024', 'wbp-constable')
ON CONFLICT (test_id, exam_id) DO NOTHING;

-- Associate questions with test-wbp-pyq-2024
INSERT INTO public.test_questions (test_id, question_id, question_order, marks)
SELECT 'test-wbp-pyq-2024', q.id, ROW_NUMBER() OVER (ORDER BY q.created_at), 1.00
FROM public.questions q
WHERE NOT EXISTS (
    SELECT 1 FROM public.test_questions tq WHERE tq.test_id = 'test-wbp-pyq-2024'
);
