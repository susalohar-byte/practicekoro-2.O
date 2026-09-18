// PracticeKoro API layer (barrel).
// The original 2,873-line api.ts was split into domain modules; every method body was
// extracted verbatim. The `api` object below keeps the exact same public surface, so
// all existing `import { api } from '@/services/api'` call sites remain valid.
import { catalogApi } from '@/services/domains/catalog';
import { subscriptionApi } from '@/services/domains/subscription';
import { adminCommerceApi } from '@/services/domains/adminCommerce';
import { adminApi } from '@/services/domains/admin';
import * as auditLogDomain from '@/services/domains/auditLog';

export const api = {
  ...catalogApi,
  ...subscriptionApi,
  ...adminCommerceApi,
  ...adminApi,
  ...auditLogDomain,
};

export type { Exam, Subject, Chapter, TestSeries, MockTest, Question } from '@/types';
