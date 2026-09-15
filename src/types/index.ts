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
  totalVacancies?: number;
}

export interface Subject {
  id: string;
  examId: string;
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
  orderIndex: number;
  isActive: boolean;
  testsCount?: number;
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
  examId: string;
  subjectId?: string;
  chapterId?: string;
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
  associatedExamIds?: string[];
  orderIndex: number;
  isActive: boolean;
  status: 'draft' | 'published' | 'archived';
  examTitle?: string;
  subjectName?: string;
  chapterName?: string;
  testSeriesTitle?: string;
}

export interface Question {
  id: string;
  chapterId?: string;
  subjectId?: string;
  questionText: string;
  questionBengaliText?: string;
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
  isActive: boolean;
  status?: 'active' | 'archived' | 'draft';
  subjectName?: string;
  chapterName?: string;
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
  difficulty?: 'easy' | 'medium' | 'hard' | string;
  correctOption?: 'A' | 'B' | 'C' | 'D';
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  explanation?: string;
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
