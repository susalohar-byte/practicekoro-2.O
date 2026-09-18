export type UserRole = 'student' | 'admin' | 'instructor';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  targetExamId?: string;
  role: UserRole;
  createdAt: string;
}

export interface Exam {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  iconName: string;
  bannerUrl?: string;
  orderIndex: number;
  isActive: boolean;
  fullMockCount?: number;
  pyqCount?: number;
  topicTestCount?: number;
  fullMocksCount?: number;
  pyqsCount?: number;
  topicTestsCount?: number;
  testsCount?: number;
  subjectsCount?: number;
  totalVacancies?: number;
}

export interface ExamCategory {
  id: string;
  name: string;
  orderIndex: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface Subject {
  id: string;
  examId?: string;
  name: string;
  slug: string;
  description?: string;
  iconName: string;
  orderIndex: number;
  isActive: boolean;
  chaptersCount?: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  orderIndex: number;
  isActive: boolean;
  testsCount?: number;
  updatedAt?: string;
}

export type Topic = Chapter;

export interface ExamTopicMapping {
  id?: string;
  examId: string;
  topicId: string;
  orderIndex?: number;
  createdAt?: string;
  topicName?: string;
  subjectName?: string;
  subjectId?: string;
}

export interface TestSeries {
  id: string;
  examId: string;
  title: string;
  slug: string;
  description?: string;
  isPremium: boolean;
  orderIndex: number;
  isActive: boolean;
  createdAt?: string;
  examTitle?: string;
  testCount?: number;
  testsCount?: number;
}

export interface MockTest {
  id: string;
  examId?: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  testSeriesId?: string;
  title: string;
  slug: string;
  description?: string;
  testType: 'chapter_mock' | 'full_mock' | 'subject_mock' | 'pyq' | 'topic';
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarking: number;
  isPremium: boolean;
  year?: number;
  paperName?: string;
  shift?: string;
  setName?: string;
  examDate?: string;
  associatedExamIds?: string[];
  orderIndex: number;
  isActive: boolean;
  status: 'draft' | 'published' | 'archived';
  examTitle?: string;
  subjectName?: string;
  chapterName?: string;
  topicName?: string;
  testSeriesTitle?: string;
}

export interface Question {
  id: string;
  chapterId?: string;
  topicId?: string;
  subjectId?: string;
  questionText: string;
  questionBengaliText?: string;
  imageUrl?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  explanationBengali?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
  defaultMarks: number;
  defaultNegativeMarks: number;
  questionType?: string;
  sourceType?: 'topic' | 'pyq' | 'other';
  sourceYear?: number;
  sourceExam?: string;
  sourcePaper?: string;
  sourceShift?: string;
  isActive: boolean;
  status?: 'active' | 'archived' | 'draft';
  subjectName?: string;
  chapterName?: string;
  topicName?: string;
  testId?: string;
  testTitle?: string;
}

export interface AdminDashboardStats {
  totalExams: number;
  activeExams: number;
  totalSubjects: number;
  totalChapters: number;
  totalTestSeries: number;
  totalTests: number;
  publishedTests: number;
  draftTests: number;
  archivedTests: number;
  totalQuestions: number;
  activeQuestions: number;
  totalAttempts: number;
  completedAttempts: number;
  totalStudents: number;
}

export interface TestQuestionAssignment {
  questionId: string;
  questionOrder: number;
  marks: number;
  negativeMarks: number;
  questionText?: string;
  questionBengaliText?: string;
  imageUrl?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
  correctOption?: 'A' | 'B' | 'C' | 'D';
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  explanation?: string;
  explanationBengali?: string;
  subjectId?: string;
  subjectName?: string;
  chapterId?: string;
  chapterName?: string;
}

export interface PublishValidationResult {
  isValid: boolean;
  errors: string[];
}

/** Sanitized question returned to student during active exam */
export interface StudentTestQuestion {
  id: string;
  questionOrder: number;
  questionText: string;
  questionBengaliText?: string;
  imageUrl?: string;
  subjectId?: string;
  subjectName?: string;
  chapterId?: string;
  chapterName?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  marks: number;
  negativeMarks: number;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
}

export interface AttemptAnswerState {
  questionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  isMarkedForReview: boolean;
  timeSpentSeconds: number;
}

export interface StudentAttemptExportRow {
  rank: number;
  candidateName: string;
  email: string;
  phone?: string;
  score: number;
  totalMarks: number;
  percentage: number;
  accuracy: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  timeSpentMinutes: string;
  attemptDate: string;
}

export interface TestAttempt {
  id: string;
  userId: string;
  testId: string;
  testTitle?: string;
  examTitle?: string;
  subjectName?: string;
  chapterName?: string;
  durationMinutes?: number;
  totalQuestions?: number;
  isPremium?: boolean;
  testType?: 'chapter_mock' | 'full_mock' | 'subject_mock' | 'pyq' | 'topic';
  year?: number;
  attemptNumber?: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  startTime: string;
  endTime?: string;
  timeSpentSeconds: number;
  score: number;
  totalMarks: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  accuracy: number;
  rank?: number | null;
  percentile?: number | null;
  createdAt: string;
}

export interface GradedResult {
  attemptId: string;
  testId: string;
  testTitle?: string;
  score: number;
  totalMarks: number;
  percentage: number;
  accuracy: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  timeSpentSeconds: number;
  rank: number | null;
  totalCandidates: number;
  percentile: number | null;
  passed: boolean;
}

export interface QuestionSolution {
  id: string;
  questionOrder: number;
  questionText: string;
  questionBengaliText?: string;
  imageUrl?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  correctOption: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  marksAwarded: number;
  explanation?: string;
  explanationBengali?: string;
  isBookmarked?: boolean;
  subjectId?: string;
  subjectName?: string;
  chapterId?: string;
  chapterName?: string;
}

export interface MistakeItem {
  id: string;
  userId: string;
  questionId: string;
  question: Question;
  wrongCount: number;
  isResolved: boolean;
  lastReviewedAt?: string;
  createdAt: string;
  examTitle?: string;
  subjectName?: string;
  chapterName?: string;
}

export interface BookmarkItem {
  id: string;
  userId: string;
  questionId: string;
  question: Question;
  note?: string;
  createdAt: string;
  examTitle?: string;
  subjectName?: string;
  chapterName?: string;
}

export interface SubscriptionPlan {
  id: string;
  name?: string;
  title: string;
  description?: string;
  durationDays: number;
  price: number;
  originalPrice?: number;
  currency: string;
  features: string[];
  isActive: boolean;
  orderIndex: number;
}

export type SubscriptionStatus = 'pending' | 'active' | 'expired' | 'cancelled' | 'failed';

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan?: SubscriptionPlan;
  status: SubscriptionStatus;
  startsAt: string;
  expiresAt: string;
  createdAt: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  userId: string;
  planId?: string;
  planTitle?: string;
  amount: number;
  currency: string;
  gateway: string;
  orderId?: string;
  razorpayOrderId?: string;
  transactionId?: string;
  razorpayPaymentId?: string;
  status: PaymentStatus;
  createdAt: string;
  studentName?: string;
  studentEmail?: string;
}

export interface RazorpayOrderResponse {
  orderId: string;
  paymentId: string;
  planId: string;
  planTitle: string;
  amount: number;
  currency: string;
  durationDays: number;
  keyId: string;
}

export interface RazorpayVerificationPayload {
  orderId: string;
  paymentId: string;
  signature: string;
  planId: string;
}

export interface StudentSubscriptionDetails {
  hasSubscription: boolean;
  isActive: boolean;
  status: SubscriptionStatus | 'none';
  subscriptionId?: string;
  planId?: string;
  planTitle?: string;
  startsAt?: string;
  expiresAt?: string;
  daysRemaining?: number;
}

export interface AdminSubscriptionRow {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  planId: string;
  planTitle: string;
  status: SubscriptionStatus;
  startsAt: string;
  expiresAt: string;
  paymentId?: string;
  daysRemaining: number;
  createdAt: string;
}

export interface AdminPaymentRow {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  planId?: string;
  planTitle?: string;
  amount: number;
  currency: string;
  gateway: string;
  orderId?: string;
  razorpayOrderId?: string;
  transactionId?: string;
  razorpayPaymentId?: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface RevenueTrendPoint {
  date: string;
  label: string;
  amount: number;
}

export interface AdminActivityItem {
  id: string;
  type: 'payment' | 'registration' | 'test_created' | 'exam_created' | string;
  description: string;
  timestamp: string;
}

export interface AdminDashboardV2Stats {
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  revenueTrend: RevenueTrendPoint[];
  totalStudents: number;
  newStudents: number;
  activeStudents: number;
  freeStudents: number;
  proStudents: number;
  activeSubscriptions: number;
  totalExams: number;
  totalTests: number;
  topicTests: number;
  fullMockTests: number;
  pyqTests: number;
  totalQuestions: number;
  topicQuestions: number;
  fullMockQuestions: number;
  pyqQuestions: number;
  recentActivity: AdminActivityItem[];
}

export interface AdminStudentRow {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  planTitle: string;
  planId: string;
  subscriptionStatus: 'active' | 'expired' | 'none' | string;
  isPro: boolean;
  expiresAt?: string;
  totalAttempts: number;
  lastActive: string;
}

export interface AdminStudentDetails extends AdminStudentRow {
  recentAttempts: TestAttempt[];
  paymentHistory: AdminPaymentRow[];
  subscriptionHistory: AdminSubscriptionRow[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  targetAudience: 'all' | 'free' | 'pro' | 'free_users' | 'pro_users' | string;
  channel: 'in_app' | 'push' | 'both';
  status: 'draft' | 'sent' | 'scheduled';
  sentAt?: string;
  scheduledAt?: string;
  createdAt: string;
  createdBy?: string;
}

export interface SupportTicketItem {
  id: string;
  userId?: string;
  studentName: string;
  studentEmail: string;
  subject: string;
  issue: string;
  category:
    | 'Account Issue'
    | 'Payment Issue'
    | 'Subscription Issue'
    | 'Test Issue'
    | 'Result Issue'
    | 'Technical Issue'
    | 'Other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  assignedTo?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettingItem {
  id: string;
  category: string;
  key: string;
  value: unknown;
  description?: string;
  updatedAt: string;
}

export interface CouponItem {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  maxUses?: number;
  usedCount: number;
  maxUsesPerUser: number;
  applicablePlanId?: string;
  validFrom: string;
  validUntil?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponUsageItem {
  id: string;
  couponId: string;
  userId?: string;
  paymentId?: string;
  orderAmount: number;
  discountAmount: number;
  finalAmount: number;
  usedAt: string;
}

export interface CouponValidationResult {
  valid: boolean;
  couponId?: string;
  code?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount: number;
  finalPrice: number;
  message: string;
}

