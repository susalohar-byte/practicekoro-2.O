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
  subjectsCount?: number;
  testsCount?: number;
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
  testType: 'chapter_mock' | 'full_mock' | 'subject_mock' | 'pyq';
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarking: number;
  isPremium: boolean;
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
  difficulty: 'easy' | 'medium' | 'hard';
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
  difficulty?: 'easy' | 'medium' | 'hard';
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
  difficulty: 'easy' | 'medium' | 'hard';
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
}

export interface BookmarkItem {
  id: string;
  userId: string;
  questionId: string;
  question: Question;
  note?: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  title: string;
  description?: string;
  durationDays: number;
  price: number;
  originalPrice?: number;
  features: string[];
  isActive: boolean;
  orderIndex: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan?: SubscriptionPlan;
  status: 'active' | 'expired' | 'cancelled';
  startsAt: string;
  expiresAt: string;
  createdAt: string;
}
