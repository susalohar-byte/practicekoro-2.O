-- =============================================================
-- PRACTICEKORO: MIGRATION 024 - COUPONS & DISCOUNTS SUBSYSTEM
-- =============================================================

CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    max_discount_amount NUMERIC(10, 2),
    min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    max_uses_per_user INTEGER NOT NULL DEFAULT 1,
    applicable_plan_id TEXT REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON public.coupons(valid_until);

-- Coupon Usages Audit Table
CREATE TABLE IF NOT EXISTS public.coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_id TEXT,
    order_amount NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) NOT NULL,
    final_amount NUMERIC(10, 2) NOT NULL,
    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON public.coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user_id ON public.coupon_usages(user_id);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

-- Admins can manage all coupons
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons"
    ON public.coupons
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Authenticated students can view active coupons
DROP POLICY IF EXISTS "Students can view active coupons" ON public.coupons;
CREATE POLICY "Students can view active coupons"
    ON public.coupons
    FOR SELECT
    TO authenticated
    USING (is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW()));

-- Coupon Usages Policies
DROP POLICY IF EXISTS "Admins can view all coupon usages" ON public.coupon_usages;
CREATE POLICY "Admins can view all coupon usages"
    ON public.coupon_usages
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can view their own coupon usages" ON public.coupon_usages;
CREATE POLICY "Users can view their own coupon usages"
    ON public.coupon_usages
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT SELECT, INSERT ON public.coupon_usages TO authenticated;
GRANT ALL ON public.coupons TO service_role;
GRANT ALL ON public.coupon_usages TO service_role;

-- -------------------------------------------------------------
-- RPC: Validate Coupon Code Function
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_coupon_code(
    p_code TEXT,
    p_plan_id TEXT,
    p_amount NUMERIC,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_coupon RECORD;
    v_user_uses INTEGER := 0;
    v_discount NUMERIC(10, 2) := 0;
    v_final NUMERIC(10, 2) := p_amount;
BEGIN
    -- Normalize code
    SELECT * INTO v_coupon
    FROM public.coupons
    WHERE UPPER(code) = UPPER(TRIM(p_code))
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', FALSE, 'message', 'Invalid coupon code.');
    END IF;

    IF NOT v_coupon.is_active THEN
        RETURN jsonb_build_object('valid', FALSE, 'message', 'This coupon is inactive.');
    END IF;

    IF v_coupon.valid_from > NOW() THEN
        RETURN jsonb_build_object('valid', FALSE, 'message', 'This coupon is not yet active.');
    END IF;

    IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < NOW() THEN
        RETURN jsonb_build_object('valid', FALSE, 'message', 'This coupon has expired.');
    END IF;

    IF v_coupon.applicable_plan_id IS NOT NULL AND v_coupon.applicable_plan_id != p_plan_id THEN
        RETURN jsonb_build_object('valid', FALSE, 'message', 'This coupon is not applicable for this plan.');
    END IF;

    IF p_amount < v_coupon.min_order_amount THEN
        RETURN jsonb_build_object('valid', FALSE, 'message', 'Minimum order amount for this coupon is ₹' || v_coupon.min_order_amount);
    END IF;

    IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
        RETURN jsonb_build_object('valid', FALSE, 'message', 'This coupon usage limit has been reached.');
    END IF;

    -- Check per-user usage
    IF p_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_user_uses
        FROM public.coupon_usages
        WHERE coupon_id = v_coupon.id AND user_id = p_user_id;

        IF v_user_uses >= v_coupon.max_uses_per_user THEN
            RETURN jsonb_build_object('valid', FALSE, 'message', 'You have already reached the maximum usage limit for this coupon.');
        END IF;
    END IF;

    -- Calculate discount
    IF v_coupon.discount_type = 'percentage' THEN
        v_discount := ROUND((p_amount * v_coupon.discount_value / 100.0), 2);
        IF v_coupon.max_discount_amount IS NOT NULL AND v_discount > v_coupon.max_discount_amount THEN
            v_discount := v_coupon.max_discount_amount;
        END IF;
    ELSIF v_coupon.discount_type = 'fixed' THEN
        v_discount := v_coupon.discount_value;
    END IF;

    IF v_discount > p_amount THEN
        v_discount := p_amount;
    END IF;

    v_final := p_amount - v_discount;

    RETURN jsonb_build_object(
        'valid', TRUE,
        'coupon_id', v_coupon.id,
        'code', v_coupon.code,
        'discount_type', v_coupon.discount_type,
        'discount_value', v_coupon.discount_value,
        'discount_amount', v_discount,
        'final_price', v_final,
        'message', 'Coupon applied successfully!'
    );
END;
$$;

-- -------------------------------------------------------------
-- Seed Initial Promotional Coupons
-- -------------------------------------------------------------
INSERT INTO public.coupons (
    code,
    description,
    discount_type,
    discount_value,
    max_discount_amount,
    min_order_amount,
    max_uses,
    max_uses_per_user,
    applicable_plan_id,
    valid_from,
    valid_until,
    is_active
)
VALUES
(
    'WELCOME50',
    'Special ₹50 introductory discount for new aspirants',
    'fixed',
    50.00,
    NULL,
    199.00,
    500,
    1,
    'pro_1_year',
    NOW(),
    NOW() + INTERVAL '180 days',
    TRUE
),
(
    'FESTIVE20',
    'Festive 20% discount on 1-Year All-Access Pro Pass',
    'percentage',
    20.00,
    100.00,
    299.00,
    1000,
    1,
    'pro_1_year',
    NOW(),
    NOW() + INTERVAL '90 days',
    TRUE
),
(
    'PROPASS100',
    'Special seasonal ₹100 flat off on Pro Pass',
    'fixed',
    100.00,
    NULL,
    299.00,
    250,
    1,
    'pro_1_year',
    NOW(),
    NOW() + INTERVAL '60 days',
    TRUE
)
ON CONFLICT (code) DO NOTHING;
