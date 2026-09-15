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
import {
  MOCK_CHAPTERS,
  MOCK_EXAMS,
  MOCK_QUESTIONS,
  MOCK_SUBJECTS,
  MOCK_TESTS,
  MOCK_TEST_SERIES,
} from './mockData';

export const localExams: Exam[] = [...MOCK_EXAMS];
export const localSubjects: Subject[] = Object.values(MOCK_SUBJECTS).flat();
export const localChapters: Chapter[] = Object.values(MOCK_CHAPTERS).flat();
export const localTestSeries: TestSeries[] = Object.values(MOCK_TEST_SERIES).flat();
export const localTests: MockTest[] = Object.values(MOCK_TESTS).flat();
export const localQuestions: Question[] = Object.values(MOCK_QUESTIONS).flat();
export const localTestQuestions: {
  id: string;
  testId: string;
  questionId: string;
  questionOrder: number;
  marks: number;
  negativeMarks: number;
}[] = [];

Object.entries(MOCK_QUESTIONS).forEach(([testId, questions]) => {
  questions.forEach((question, index) => {
    localTestQuestions.push({
      id: `tq-${testId}-${question.id}`,
      testId,
      questionId: question.id,
      questionOrder: index + 1,
      marks: question.defaultMarks || 1,
      negativeMarks: question.defaultNegativeMarks || 0.25,
    });
  });
});

export const localAttemptsStore: Record<
  string,
  {
    attempt: TestAttempt;
    answers: Record<string, AttemptAnswerState>;
    result?: GradedResult;
  }
> = {};
