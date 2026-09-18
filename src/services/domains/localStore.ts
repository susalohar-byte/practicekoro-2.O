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
  ExamCategory,
  GradedResult,
  MockTest,
  Question,
  Subject,
  TestAttempt,
  TestSeries,
  CouponItem,
  NotificationItem,
  AppSettingItem,
  SupportTicketItem,
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

export const localExamCategories: ExamCategory[] = [
  { id: 'cat_police', name: 'Police Exams', orderIndex: 1, isActive: true },
  { id: 'cat_teaching', name: 'Teaching Exams', orderIndex: 2, isActive: true },
  { id: 'cat_civil', name: 'Civil Services', orderIndex: 3, isActive: true },
  { id: 'cat_ssc', name: 'SSC & Staff Selection', orderIndex: 4, isActive: true },
  { id: 'cat_railways', name: 'Railways', orderIndex: 5, isActive: true },
  { id: 'cat_defence', name: 'Defence', orderIndex: 6, isActive: true },
  { id: 'cat_banking', name: 'Banking', orderIndex: 7, isActive: true },
  { id: 'cat_state_govt', name: 'State Govt.', orderIndex: 8, isActive: true },
];

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

// Fallback in-memory notification store
export const localNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New WBP Constable Full Mock Test 05 Released',
    message:
      'The latest Full Mock Test is now live for all enrolled students. Complete your full 85-question simulation.',
    targetAudience: 'all',
    channel: 'in_app',
    status: 'sent',
    sentAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-pro-1',
    title: 'Pro Exclusive: New Subject-Wise GK Marathon Released',
    message:
      'Special 1500+ curated GK & Static Awareness question drill is now available for all Pro Pass aspirants.',
    targetAudience: 'pro',
    channel: 'in_app',
    status: 'sent',
    sentAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-free-1',
    title: 'Free Mock Test Available Today',
    message:
      'Take our free weekly demo mock test to analyze your West Bengal Police preparation level!',
    targetAudience: 'free',
    channel: 'in_app',
    status: 'sent',
    sentAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
];

export function syncLocalScheduledNotifications(): NotificationItem[] {
  const now = new Date();
  localNotifications.forEach((n) => {
    if (n.status === 'scheduled' && n.scheduledAt && new Date(n.scheduledAt) <= now) {
      n.status = 'sent';
      n.sentAt = n.scheduledAt;
    }
  });
  return localNotifications;
}

export const localAppSettings: AppSettingItem[] = [
  {
    id: 'general_app_name',
    category: 'general',
    key: 'app_name',
    value: 'PracticeKoro',
    description: 'Platform name displayed across UI',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'general_support_email',
    category: 'general',
    key: 'support_email',
    value: 'support@practicekoro.online',
    description: 'Support contact email',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'general_support_phone',
    category: 'general',
    key: 'support_phone',
    value: '+91 98765 43210',
    description: 'Support phone helpline',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'general_website_url',
    category: 'general',
    key: 'website_url',
    value: 'https://practicekoro.online',
    description: 'Official web application domain',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exam_default_duration',
    category: 'exam_defaults',
    key: 'default_duration_minutes',
    value: 60,
    description: 'Standard default exam duration in minutes',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exam_default_marks',
    category: 'exam_defaults',
    key: 'default_marks_per_q',
    value: 1.0,
    description: 'Standard default marks per correct question',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exam_default_negative_marks',
    category: 'exam_defaults',
    key: 'default_negative_marks',
    value: 0.25,
    description: 'Standard default negative marking',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exam_passing_percentage',
    category: 'exam_defaults',
    key: 'default_passing_percentage',
    value: 35,
    description: 'Standard passing score percentage',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub_currency',
    category: 'subscription',
    key: 'currency',
    value: 'INR',
    description: 'Platform transaction currency',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub_expiry_warning_days',
    category: 'subscription',
    key: 'expiry_warning_days',
    value: 7,
    description: 'Days before expiry to display renewal warning',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sys_maintenance_mode',
    category: 'system',
    key: 'maintenance_mode',
    value: false,
    description: 'Enable platform maintenance splash mode',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sys_app_version',
    category: 'system',
    key: 'app_version',
    value: '2.0.0',
    description: 'Platform production release version',
    updatedAt: new Date().toISOString(),
  },
];

export const localSupportTickets: SupportTicketItem[] = [
  {
    id: 'tkt_101',
    userId: 'user_student_1',
    studentName: 'Sourav Ganguly',
    studentEmail: 'sourav.aspirant@example.com',
    subject: 'Question 14 Answer Key in WBCS Prelims Mock #2',
    issue: 'In question 14, option B was marked correct, but according to latest syllabus Option C is verified by standard texts.',
    category: 'Test Issue',
    priority: 'medium',
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'tkt_102',
    userId: 'user_student_2',
    studentName: 'Ananya Roy',
    studentEmail: 'ananya.wb@example.com',
    subject: 'UPI Payment debited but Pro Pass delayed',
    issue: 'I paid ₹499 via Google Pay for 1-Year Pro Pass. UTR 428198271891. Please verify and activate.',
    category: 'Payment Issue',
    priority: 'high',
    status: 'resolved',
    resolutionNotes: 'Verified with gateway logs. Transaction was captured. Pro Pass manually renewed for 365 days.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];


