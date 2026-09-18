import {
  MOCK_EXAMS,
  MOCK_SUBJECTS,
  MOCK_CHAPTERS,
  MOCK_TEST_SERIES,
  MOCK_TESTS,
  MOCK_QUESTIONS,
} from '@/services/mockData';
import type { Database } from '@/types/database';
import type {
  AttemptAnswerState,
  Chapter,
  Exam,
  GradedResult,
  MockTest,
  Question,
  Subject,
  TestAttempt,
  TestSeries,
  CouponItem,
} from '@/types';

// Shared in-memory fallback stores (used when Supabase is unconfigured).
// Extracted verbatim from the original src/services/api.ts during the domain split.

export type ExamRow = Database['public']['Tables']['exams']['Row'];
export type SubjectRow = Database['public']['Tables']['subjects']['Row'];
export type ChapterRow = Database['public']['Tables']['chapters']['Row'];
export type TestRow = Database['public']['Tables']['tests']['Row'];
export type QuestionRow = Database['public']['Tables']['questions']['Row'];
export type AttemptRow = Database['public']['Tables']['test_attempts']['Row'];
export type MistakeRow = Database['public']['Tables']['mistakes']['Row'];
export type BookmarkRow = Database['public']['Tables']['bookmarks']['Row'];
export type PlanRow = Database['public']['Tables']['subscription_plans']['Row'];

export const localExams: Exam[] = [...MOCK_EXAMS];
export const localSubjects: Subject[] = Object.values(MOCK_SUBJECTS).flat();
export const localChapters: Chapter[] = Object.values(MOCK_CHAPTERS).flat();
export const localTestSeries: TestSeries[] = Object.values(MOCK_TEST_SERIES).flat();
export const localTests: MockTest[] = Object.values(MOCK_TESTS).flat();
export const localQuestions: Question[] = Object.values(MOCK_QUESTIONS).flat();

// Local test-question assignments store for offline demo
export const localTestQuestions: {
  id: string;
  testId: string;
  questionId: string;
  questionOrder: number;
  marks: number;
  negativeMarks: number;
}[] = [];

// Initialize localTestQuestions from MOCK_QUESTIONS and MOCK_TESTS
Object.entries(MOCK_QUESTIONS).forEach(([testId, questions]) => {
  questions.forEach((q, idx) => {
    localTestQuestions.push({
      id: `tq-${testId}-${q.id}`,
      testId,
      questionId: q.id,
      questionOrder: idx + 1,
      marks: q.defaultMarks || 1.0,
      negativeMarks: q.defaultNegativeMarks || 0.25,
    });
  });
});

// Local in-memory store for session attempts & submissions (for fallback/offline demo)
export const localAttemptsStore: Record<
  string,
  {
    attempt: TestAttempt;
    answers: Record<string, AttemptAnswerState>;
    result?: GradedResult;
  }
> = {};

// Local in-memory store for promotional coupons
export const localCoupons: CouponItem[] = [
  {
    id: 'coupon_welcome50',
    code: 'WELCOME50',
    description: 'Special ₹50 introductory discount for new aspirants',
    discountType: 'fixed',
    discountValue: 50,
    minOrderAmount: 199,
    maxUses: 500,
    usedCount: 38,
    maxUsesPerUser: 1,
    applicablePlanId: 'pro_1_year',
    validFrom: new Date(Date.now() - 30 * 86400000).toISOString(),
    validUntil: new Date(Date.now() + 150 * 86400000).toISOString(),
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'coupon_festive20',
    code: 'FESTIVE20',
    description: 'Festive 20% discount on 1-Year All-Access Pro Pass',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscountAmount: 100,
    minOrderAmount: 299,
    maxUses: 1000,
    usedCount: 142,
    maxUsesPerUser: 1,
    applicablePlanId: 'pro_1_year',
    validFrom: new Date(Date.now() - 15 * 86400000).toISOString(),
    validUntil: new Date(Date.now() + 75 * 86400000).toISOString(),
    isActive: true,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'coupon_propass100',
    code: 'PROPASS100',
    description: 'Special seasonal ₹100 flat off on Pro Pass',
    discountType: 'fixed',
    discountValue: 100,
    minOrderAmount: 299,
    maxUses: 250,
    usedCount: 89,
    maxUsesPerUser: 1,
    applicablePlanId: 'pro_1_year',
    validFrom: new Date(Date.now() - 5 * 86400000).toISOString(),
    validUntil: new Date(Date.now() + 55 * 86400000).toISOString(),
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];
