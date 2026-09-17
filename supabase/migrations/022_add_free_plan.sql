-- ============================================================================
-- MIGRATION 022: Add Free Plan to subscription_plans
-- Free plan for users who don't purchase any paid plan.
-- Paid plan users get access to ALL content (free + paid).
-- ============================================================================

-- Insert the Free Plan (idempotent: skip if already exists)
INSERT INTO public.subscription_plans (
    id,
    title,
    description,
    duration_days,
    price,
    original_price,
    features,
    is_active,
    order_index
) VALUES (
    'plan_free',
    'Free Plan',
    'Basic access to free practice content. Topic-wise practice tests and limited mock tests available for all aspirants.',
    36500,
    0,
    0,
    '["Topic-wise Practice Tests (Free)", "Limited Free Mock Tests", "Basic Performance Summary", "Mistakes Notebook (Last 5 Tests)", "Bengali & English Questions"]'::jsonb,
    true,
    0
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    order_index = EXCLUDED.order_index;

-- Ensure existing paid plans have higher order_index so Free Plan appears first
UPDATE public.subscription_plans
SET order_index = GREATEST(order_index, 1)
WHERE id != 'plan_free' AND order_index < 1;
