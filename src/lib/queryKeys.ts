/**
 * Central query-key registry for TanStack Query.
 *
 * Keeping every key in one module prevents the classic failure mode where two
 * screens invent slightly different keys for the same data (breaking cache
 * sharing) or forget to invalidate a dependent key after a mutation.
 *
 * Convention: keys are arrays, ordered from general to specific, so a broader
 * prefix (`['exams']`) can invalidate every derived query with
 * `queryClient.invalidateQueries({ queryKey: queryKeys.exams.all })`.
 */
export const queryKeys = {
  exams: {
    all: ['exams'] as const,
    list: () => [...queryKeys.exams.all, 'list'] as const,
    detail: (examId: string) => [...queryKeys.exams.all, 'detail', examId] as const,
    subjectsWithTopics: (examId: string) =>
      [...queryKeys.exams.all, 'subjects-with-topics', examId] as const,
    topicMappings: (examId: string) => [...queryKeys.exams.all, 'topic-mappings', examId] as const,
  },
  subjects: {
    all: ['subjects'] as const,
    byExam: (examId?: string) => [...queryKeys.subjects.all, examId ?? 'all'] as const,
  },
  topics: {
    all: ['topics'] as const,
    bySubject: (subjectId: string) => [...queryKeys.topics.all, subjectId] as const,
  },
  questions: {
    all: ['questions'] as const,
    page: (filtersKey: string, page: number, pageSize: number) =>
      [...queryKeys.questions.all, 'page', filtersKey, page, pageSize] as const,
  },
  tests: {
    all: ['tests'] as const,
    byExam: (examId: string, testType?: string) =>
      [...queryKeys.tests.all, 'by-exam', examId, testType ?? 'all'] as const,
    detail: (testId: string) => [...queryKeys.tests.all, 'detail', testId] as const,
    assignedQuestions: (testId: string) =>
      [...queryKeys.tests.all, 'assigned-questions', testId] as const,
  },
} as const;
