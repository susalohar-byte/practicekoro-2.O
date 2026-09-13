-- ============================================================================
-- PRACTICEKORO ROW LEVEL SECURITY & AUTHORIZATION (PHASE 1)
-- ============================================================================

-- Helper: Check if a user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(p_user_id UUID, p_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = p_user_id AND role = p_role
    ) OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = p_user_id AND role = p_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: Check if user has an active All-Access subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.subscriptions
        WHERE user_id = p_user_id
          AND status = 'active'
          AND expires_at > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: Secure test access check (Free test OR active subscriber OR admin)
CREATE OR REPLACE FUNCTION public.has_test_access(p_user_id UUID, p_test_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_premium BOOLEAN;
BEGIN
    -- Check if test is free
    SELECT is_premium INTO v_is_premium FROM public.tests WHERE id = p_test_id;
    IF v_is_premium IS FALSE THEN
        RETURN TRUE;
    END IF;

    -- If user is admin, allow access
    IF public.has_role(p_user_id, 'admin') THEN
        RETURN TRUE;
    END IF;

    -- If test is premium, user MUST have an active subscription
    RETURN public.has_active_subscription(p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Automatically create profile on new user signup in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        'student'
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
CREATE POLICY "Profiles are viewable by owner or admin"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- 2. User Roles
CREATE POLICY "Users can read own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Exams, Subjects, Chapters, Test Series, Tests (Public read active, Admin manage)
CREATE POLICY "Public read active exams"
ON public.exams FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin manage exams"
ON public.exams FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read active subjects"
ON public.subjects FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin manage subjects"
ON public.subjects FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read active chapters"
ON public.chapters FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin manage chapters"
ON public.chapters FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read active test series"
ON public.test_series FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin manage test series"
ON public.test_series FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read active tests"
ON public.tests FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin manage tests"
ON public.tests FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 4. Questions & Test Questions
CREATE POLICY "Questions readable by authenticated users"
ON public.questions FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin manage questions"
ON public.questions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Test questions readable by authenticated users"
ON public.test_questions FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin manage test questions"
ON public.test_questions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 5. Subscription Plans
CREATE POLICY "Public read active plans"
ON public.subscription_plans FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin manage subscription plans"
ON public.subscription_plans FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 6. Subscriptions & Payments
CREATE POLICY "Users read own subscriptions"
ON public.subscriptions FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin manage subscriptions"
ON public.subscriptions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users read own payments"
ON public.payments FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own payments"
ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Test Attempts & Answers
CREATE POLICY "Users manage own test attempts"
ON public.test_attempts FOR ALL USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users manage own attempt answers"
ON public.attempt_answers FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.test_attempts
        WHERE id = attempt_answers.attempt_id
          AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
);

-- 8. Test Results
CREATE POLICY "Users read own test results"
ON public.test_results FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users or engine insert test results"
ON public.test_results FOR INSERT WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 9. Mistakes Notebook
CREATE POLICY "Users manage own mistakes"
ON public.mistakes FOR ALL USING (auth.uid() = user_id);

-- 10. Bookmarks
CREATE POLICY "Users manage own bookmarks"
ON public.bookmarks FOR ALL USING (auth.uid() = user_id);
