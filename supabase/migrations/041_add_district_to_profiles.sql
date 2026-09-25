-- ============================================================================
-- MIGRATION 041: Add District column to profiles and update user signup trigger
-- Enables District-wise Rank & Leaderboard filtering for all 23 West Bengal districts
-- ============================================================================

-- 1. Add district column if it does not already exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS district TEXT;

-- 2. Index district for high-speed district-wise rank queries
CREATE INDEX IF NOT EXISTS idx_profiles_district ON public.profiles(district);

-- 3. Update handle_new_user() trigger function to extract and store district metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, district, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NULLIF(TRIM(NEW.raw_user_meta_data->>'district'), ''),
        'student'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        district = COALESCE(NULLIF(TRIM(EXCLUDED.district), ''), public.profiles.district);

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
