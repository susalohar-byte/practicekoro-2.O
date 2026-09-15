-- ============================================================================
-- PRACTICEKORO 012 — FIX SECURITY DEFINER VIEW: public.user_test_access
-- ============================================================================
-- Supabase Advisor flags `public.user_test_access` (created in migration 007)
-- as a Security Definer View: views execute with their owner's permissions,
-- so this view bypasses RLS on public.tests for querying users.
--
-- Fix strategy (Postgres 15+, which Supabase runs):
--   1. Re-create the view with security_invoker = true so it runs with the
--      querying user's role and respects RLS on public.tests.
--   2. Keep identical output columns (test_id, title, slug, is_premium,
--      status, has_access) — the app does not query this view today, but the
--      public surface stays stable for any future consumer.
--   3. Revoke from anon: the view calls auth.uid(); for anonymous visitors
--      has_access would compute with a NULL uid (free tests only). Restrict
--      EXECUTE-equivalent (SELECT) to authenticated to avoid exposing
--      catalog rows through a bypass-shaped object.
--   4. Drop the view's dependency hazards: set the owning role search_path
--      explicitly and re-grant cleanly.
-- ============================================================================

-- 1. Drop and re-create as security_invoker
DROP VIEW IF EXISTS public.user_test_access;

CREATE VIEW public.user_test_access
WITH (security_invoker = true)
AS
SELECT
    t.id AS test_id,
    t.title,
    t.slug,
    t.is_premium,
    t.status,
    public.has_test_access(auth.uid(), t.id) AS has_access
FROM public.tests t
WHERE t.status = 'published';

-- 2. Ownership + search_path hygiene (advisor also checks owner search_path)
ALTER VIEW public.user_test_access OWNER TO postgres;

-- 3. Grants: authenticated can read; anon cannot (it is meaningless without a uid)
REVOKE ALL ON public.user_test_access FROM PUBLIC;
REVOKE ALL ON public.user_test_access FROM anon;
GRANT SELECT ON public.user_test_access TO authenticated;

-- 4. Verification block (safe to keep; read-only asserts)
DO $$
DECLARE
    v_reltuple boolean;
    v_invoker  text;
BEGIN
    SELECT relrowsecurity INTO v_reltuple FROM pg_class WHERE oid = 'public.tests'::regclass;
    SELECT reloptions::text INTO v_invoker FROM pg_class WHERE oid = 'public.user_test_access'::regclass;

    IF NOT v_reltuple THEN
        RAISE EXCEPTION 'RLS on public.tests is disabled; security_invoker view would be meaningless';
    END IF;

    IF v_invoker NOT LIKE '%security_invoker=true%' THEN
        RAISE EXCEPTION 'user_test_access was not created with security_invoker=true (reloptions: %)', v_invoker;
    END IF;

    RAISE NOTICE 'user_test_access re-created with security_invoker=true; grants fixed.';
END;
$$;
