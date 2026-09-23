-- ============================================================================
-- Migration 037: Covering indexes for submit_test_attempt hot paths
-- ============================================================================
-- Every graded submission runs, inside public.submit_test_attempt():
--   1. SELECT COUNT(*) ... FROM test_results WHERE test_id = X AND score > Y
--      (live rank — full seq scan without an index, grows with candidates)
--   2. SELECT COUNT(*) ... FROM test_results WHERE test_id = X
--      (total candidates)
--   3. SELECT ... FROM test_results WHERE attempt_id = X
--      (submission idempotency fast-path)
-- These two composite/single-column indexes keep all three O(log n).
-- Idempotent: safe to re-run (IF NOT EXISTS).
-- Apply with: scripts/apply-migrations-prod.sh (or supabase db push)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_test_results_test_score
    ON public.test_results (test_id, score DESC);

CREATE INDEX IF NOT EXISTS idx_test_results_attempt
    ON public.test_results (attempt_id);
