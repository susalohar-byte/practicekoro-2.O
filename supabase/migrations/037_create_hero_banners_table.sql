-- ============================================================================
-- Migration 037: Enterprise Hero Banner Architecture
-- ============================================================================
-- Implements centralized, role-targeted, scheduled hero banners with:
--   1. Central table public.hero_banners with RLS & Realtime sync
--   2. Role-based targeting (all, free, pro)
--   3. Campaign scheduling window (starts_at, expires_at)
--   4. Responsive mobile artwork support (mobile_image_url)
--   5. Atomic click-count analytics RPC
--   6. Public read access & Admin-only management
--   7. Supabase Storage bucket 'banners' provisioning
-- ============================================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.hero_banners (
    id TEXT PRIMARY KEY,
    badge_text TEXT,
    title TEXT NOT NULL,
    highlight_word TEXT,
    subtitle TEXT,
    primary_cta_text TEXT NOT NULL DEFAULT 'Start Now',
    primary_cta_link TEXT NOT NULL DEFAULT '/exams',
    secondary_cta_text TEXT,
    secondary_cta_link TEXT,
    feature_pills JSONB NOT NULL DEFAULT '[]'::JSONB,
    image_url TEXT NOT NULL,
    mobile_image_url TEXT,
    banner_type TEXT NOT NULL DEFAULT 'full_image',
    theme_gradient TEXT NOT NULL DEFAULT 'blue',
    target_audience TEXT NOT NULL DEFAULT 'all', -- 'all', 'free', 'pro'
    placement TEXT NOT NULL DEFAULT 'home_hero', -- 'home_hero', 'catalog', 'all'
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    click_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for performant filtering
CREATE INDEX IF NOT EXISTS idx_hero_banners_active_order 
    ON public.hero_banners (is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_hero_banners_audience 
    ON public.hero_banners (target_audience);

CREATE INDEX IF NOT EXISTS idx_hero_banners_schedule 
    ON public.hero_banners (starts_at, expires_at);

-- 3. Enable RLS
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Allow public read access to active hero banners" ON public.hero_banners;
CREATE POLICY "Allow public read access to active hero banners"
ON public.hero_banners
FOR SELECT
USING (
    is_active = TRUE
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (expires_at IS NULL OR expires_at >= NOW())
);

DROP POLICY IF EXISTS "Allow admin full access to hero banners" ON public.hero_banners;
CREATE POLICY "Allow admin full access to hero banners"
ON public.hero_banners
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE public.users.id = auth.uid()
        AND public.users.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE public.users.id = auth.uid()
        AND public.users.role = 'admin'
    )
);

-- 5. Atomic click-counter RPC
CREATE OR REPLACE FUNCTION public.increment_banner_click(p_banner_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.hero_banners
    SET click_count = click_count + 1
    WHERE id = p_banner_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_banner_click(TEXT) TO anon, authenticated;

-- 6. Storage Bucket for Banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
DROP POLICY IF EXISTS "Public can view banner images" ON storage.objects;
CREATE POLICY "Public can view banner images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'banners');

DROP POLICY IF EXISTS "Admins can upload banner images" ON storage.objects;
CREATE POLICY "Admins can upload banner images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'banners'
    AND EXISTS (
        SELECT 1 FROM public.users
        WHERE public.users.id = auth.uid()
        AND public.users.role = 'admin'
    )
);

-- 7. Seed Initial Banners
INSERT INTO public.hero_banners (
    id, badge_text, title, highlight_word, subtitle,
    primary_cta_text, primary_cta_link, secondary_cta_text, secondary_cta_link,
    feature_pills, image_url, banner_type, theme_gradient, target_audience,
    placement, is_active, display_order, created_at
) VALUES 
(
    'banner-wb-exam-series',
    'TARGET 2026 🎯',
    'Ace WBPSC & WBP Exams with All-India Standard Mocks',
    'All-India Standard Mocks',
    'Real exam simulation, detailed bilingual solutions & in-depth AI performance rank analysis.',
    'Attempt Free Mock',
    '/exams',
    'View Test Series',
    '/exams',
    '["Real Exam Interface", "Instant Rank", "Bilingual (EN/BN)", "Negative Marking", "Full Solutions"]'::JSONB,
    '/images/exam_hero_banner.png',
    'full_image',
    'blue',
    'all',
    'home_hero',
    TRUE,
    1,
    '2026-01-01T00:00:00.000Z'
),
(
    'banner-pro-pass-special',
    'UNLIMITED ACCESS 👑',
    'Upgrade to Pro Pass & Unlock 1,000+ Mock Tests & PYQs',
    '1,000+ Mock Tests & PYQs',
    'Get complete 1-year access to all West Bengal & Central government exam test series with detailed solutions.',
    'Get Pro Pass Now',
    '/subscription',
    'Explore Features',
    '/dashboard',
    '["All Exams Unlocked", "Chapter-wise Quizzes", "Performance Tracking", "Detailed Analytics", "Ad-Free Experience"]'::JSONB,
    '/images/student_hero_banner.jpg',
    'full_image',
    'amber',
    'free',
    'home_hero',
    TRUE,
    2,
    '2026-01-02T00:00:00.000Z'
),
(
    'banner-daily-10',
    'DAILY QUIZ ⚡',
    'Daily 10 Challenge - Solve 10 Rapid MCQs Daily',
    'Daily 10 Challenge',
    'Build daily consistency with fast topic-wise practice questions & explanations.',
    'Start Daily 10',
    '/practice',
    'Practice Topics',
    '/practice',
    '["Daily Habit", "Speed & Accuracy", "Subject Revision", "Streak Badges"]'::JSONB,
    '/images/daily_10_banner_exact.png',
    'full_image',
    'indigo',
    'all',
    'home_hero',
    TRUE,
    3,
    '2026-01-03T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    image_url = EXCLUDED.image_url,
    primary_cta_link = EXCLUDED.primary_cta_link,
    updated_at = NOW();
