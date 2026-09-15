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
