-- ============================================================================
-- Migration 043: Standardize Exam Categories to 5 Curated Buckets
-- ============================================================================
-- Replaces old fragmented/legacy categories (e.g., 'Police Exams', 'Civil Services',
-- 'Teaching Exams', 'SSC & Staff Selection', 'Railways', 'Defence', 'Banking', 'State Govt.')
-- with the 5 curated categories matching the catalog and student experience:
--   1. WB Police (WBP / KP)
--   2. WBPSC (Clerkship / WBCS)
--   3. Teaching (TET / SLST)
--   4. SSC & Central Govt.
--   5. Railways (RRB)
-- ============================================================================

-- Step 1: Update public.exams table to map legacy categories to the 5 standardized names
UPDATE public.exams
SET category = 'WB Police (WBP / KP)'
WHERE LOWER(category) LIKE '%police%'
   OR LOWER(category) LIKE '%wbp%'
   OR LOWER(category) LIKE '%kp%'
   OR LOWER(category) LIKE '%constable%';

UPDATE public.exams
SET category = 'WBPSC (Clerkship / WBCS)'
WHERE LOWER(category) LIKE '%wbpsc%'
   OR LOWER(category) LIKE '%clerk%'
   OR LOWER(category) LIKE '%wbcs%'
   OR LOWER(category) LIKE '%civil%'
   OR LOWER(category) = 'other';

UPDATE public.exams
SET category = 'Teaching (TET / SLST)'
WHERE LOWER(category) LIKE '%teach%'
   OR LOWER(category) LIKE '%tet%'
   OR LOWER(category) LIKE '%slst%'
   OR LOWER(category) LIKE '%school%'
   OR LOWER(category) LIKE '%wbssc%';

UPDATE public.exams
SET category = 'SSC & Central Govt.'
WHERE LOWER(category) LIKE '%ssc%'
   OR LOWER(category) LIKE '%cgl%'
   OR LOWER(category) LIKE '%mts%'
   OR LOWER(category) LIKE '%gd%'
   OR LOWER(category) LIKE '%central%';

UPDATE public.exams
SET category = 'Railways (RRB)'
WHERE LOWER(category) LIKE '%rail%'
   OR LOWER(category) LIKE '%rrb%'
   OR LOWER(category) LIKE '%ntpc%';

-- Any remaining non-matching category defaults to WB Police (WBP / KP) if empty/legacy
UPDATE public.exams
SET category = 'WB Police (WBP / KP)'
WHERE category IS NULL
   OR TRIM(category) = ''
   OR category IN ('State Govt.', 'Defence', 'Banking');

-- Step 2: Remove legacy/obsolete rows from public.exam_categories
DELETE FROM public.exam_categories
WHERE name NOT IN (
    'WB Police (WBP / KP)',
    'WBPSC (Clerkship / WBCS)',
    'Teaching (TET / SLST)',
    'SSC & Central Govt.',
    'Railways (RRB)'
);

-- Step 3: Insert or update the 5 standardized categories with correct sort order
INSERT INTO public.exam_categories (id, name, order_index)
VALUES
    ('cat_wb_police', 'WB Police (WBP / KP)', 1),
    ('cat_wbpsc', 'WBPSC (Clerkship / WBCS)', 2),
    ('cat_teaching', 'Teaching (TET / SLST)', 3),
    ('cat_ssc', 'SSC & Central Govt.', 4),
    ('cat_railways', 'Railways (RRB)', 5)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, order_index = EXCLUDED.order_index;
