-- ============================================================================
-- PRACTICEKORO 015 — REPAIR BROKEN ADMIN/READ POLICIES (qual = true)
-- ============================================================================
-- Observed on production: every "Admin manage X" policy was stored with
-- USING (true) instead of USING (public.has_role(auth.uid(),'admin')).
-- Effect: ANY caller (including anon) could SELECT/INSERT/UPDATE/DELETE
-- content tables, and questions (with correct_option + explanations) were
-- world-readable. This migration restores the intended definitions from
-- 002_rls_policies.sql / 005 / 006 and verifies the repair.
--
-- Idempotent: DROP POLICY IF EXISTS + CREATE POLICY for every affected policy.
-- ============================================================================

begin;

-- ---------------------------------------------------------------- exams
drop policy if exists "Admin manage exams" on public.exams;
create policy "Admin manage exams"
on public.exams for all
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Public read active exams" on public.exams;
create policy "Public read active exams"
on public.exams for select
using (is_active = true or public.has_role(auth.uid(), 'admin'));

-- ------------------------------------------------------------- subjects
drop policy if exists "Admin manage subjects" on public.subjects;
create policy "Admin manage subjects"
on public.subjects for all
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Public read active subjects" on public.subjects;
create policy "Public read active subjects"
on public.subjects for select
using (is_active = true or public.has_role(auth.uid(), 'admin'));

-- ------------------------------------------------------------- chapters
drop policy if exists "Admin manage chapters" on public.chapters;
create policy "Admin manage chapters"
on public.chapters for all
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Public read active chapters" on public.chapters;
create policy "Public read active chapters"
on public.chapters for select
using (is_active = true or public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------- test_series
drop policy if exists "Admin manage test series" on public.test_series;
create policy "Admin manage test series"
on public.test_series for all
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Public read active test series" on public.test_series;
create policy "Public read active test series"
on public.test_series for select
using (is_active = true or public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------- tests
drop policy if exists "Admin manage tests" on public.tests;
create policy "Admin manage tests"
on public.tests for all
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Students/public: only active AND published tests (admins see everything)
drop policy if exists "Public read published tests" on public.tests;
drop policy if exists "Public read active tests" on public.tests;
create policy "Public read published tests"
on public.tests for select
using (
    (is_active = true and status = 'published')
    or public.has_role(auth.uid(), 'admin')
);

-- ------------------------------------------------------------ questions
-- Answers may only be read by admins; students use the SECURITY DEFINER
-- RPC get_student_exam_questions() which strips correct_option/explanation.
drop policy if exists "Admin manage questions" on public.questions;
create policy "Admin manage questions"
on public.questions for all
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Questions readable by authenticated users" on public.questions;
drop policy if exists "Questions readable by admins only" on public.questions;
create policy "Questions readable by admins only"
on public.questions for select
using (public.has_role(auth.uid(), 'admin'));

-- ------------------------------------------------------- test_questions
drop policy if exists "Admin manage test questions" on public.test_questions;
create policy "Admin manage test questions"
on public.test_questions for all
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Test questions readable by authenticated users" on public.test_questions;
create policy "Test questions readable by authenticated users"
on public.test_questions for select
to authenticated
using (auth.role() = 'authenticated');

-- -------------------------------------------------- subscription_plans
drop policy if exists "Admin manage subscription plans" on public.subscription_plans;
create policy "Admin manage subscription plans"
on public.subscription_plans for all
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Public read active plans" on public.subscription_plans;
create policy "Public read active plans"
on public.subscription_plans for select
using (is_active = true or public.has_role(auth.uid(), 'admin'));

-- ------------------------------------------------------------- verify
do $$
declare
    v_bad int;
begin
    select count(*) into v_bad
    from pg_policies
    where schemaname = 'public'
      and policyname in (
        'Admin manage exams','Admin manage subjects','Admin manage chapters',
        'Admin manage test series','Admin manage tests','Admin manage questions',
        'Admin manage test questions','Admin manage subscription plans',
        'Questions readable by admins only'
      )
      and qual = 'true';

    if v_bad > 0 then
        raise exception 'Policy repair failed: % admin policies still have qual=true', v_bad;
    end if;

    raise notice 'Migration 015: all admin/read policies repaired.';
end;
$$;

commit;
