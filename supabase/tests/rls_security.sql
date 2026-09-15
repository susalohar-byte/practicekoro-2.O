begin;
select jsonb_build_object(
  'profiles_rls', (select relrowsecurity from pg_class where oid='public.profiles'::regclass),
  'payments_rls', (select relrowsecurity from pg_class where oid='public.payments'::regclass),
  'subscriptions_rls', (select relrowsecurity from pg_class where oid='public.subscriptions'::regclass),
  'attempts_rls', (select relrowsecurity from pg_class where oid='public.test_attempts'::regclass),
  'payments_owner_policy', exists(select 1 from pg_policies where schemaname='public' and tablename='payments' and qual ilike '%auth.uid()%'),
  'subscriptions_owner_policy', exists(select 1 from pg_policies where schemaname='public' and tablename='subscriptions' and qual ilike '%auth.uid()%'),
  'gateway_mutation_blocked', not has_table_privilege('authenticated','public.payment_gateways','INSERT,UPDATE,DELETE'),
  'webhook_execute_blocked', not has_function_privilege('authenticated','public.reconcile_razorpay_webhook(text,text,numeric,text,text)','EXECUTE')
) as security_assertions;
rollback;
