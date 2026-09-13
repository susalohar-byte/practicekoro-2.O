import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  MOCK_EXAMS,
  MOCK_SUBJECTS,
  MOCK_CHAPTERS,
  MOCK_TEST_SERIES,
  MOCK_TESTS,
  MOCK_QUESTIONS,
  MOCK_ATTEMPTS,
  MOCK_MISTAKES,
  MOCK_BOOKMARKS,
  MOCK_SUBSCRIPTION_PLANS,
} from './mockData';
import type { Database, AttemptStatus } from '@/types/database';
import type {
  Exam,
  Subject,
  Chapter,
  TestSeries,
  MockTest,
  Question,
  StudentTestQuestion,
  AttemptAnswerState,
  TestAttempt,
  GradedResult,
  QuestionSolution,
  MistakeItem,
  BookmarkItem,
  SubscriptionPlan,
  AdminDashboardStats,
  TestQuestionAssignment,
  PublishValidationResult,
} from '@/types';
import { parseQuestionsCsv } from '@/utils/csvParser';

type ExamRow = Database['public']['Tables']['exams']['Row'];
type SubjectRow = Database['public']['Tables']['subjects']['Row'];
type ChapterRow = Database['public']['Tables']['chapters']['Row'];
type TestSeriesRow = Database['public']['Tables']['test_series']['Row'];
type TestRow = Database['public']['Tables']['tests']['Row'];
type QuestionRow = Database['public']['Tables']['questions']['Row'];
type AttemptRow = Database['public']['Tables']['test_attempts']['Row'];
type MistakeRow = Database['public']['Tables']['mistakes']['Row'];
type BookmarkRow = Database['public']['Tables']['bookmarks']['Row'];
type PlanRow = Database['public']['Tables']['subscription_plans']['Row'];

// Local in-memory admin stores initialized from mock data (for fallback/offline demo)
const localExams: Exam[] = [...MOCK_EXAMS];
const localSubjects: Subject[] = Object.values(MOCK_SUBJECTS).flat();
const localChapters: Chapter[] = Object.values(MOCK_CHAPTERS).flat();
const localTestSeries: TestSeries[] = Object.values(MOCK_TEST_SERIES).flat();
const localTests: MockTest[] = Object.values(MOCK_TESTS).flat();
const localQuestions: Question[] = Object.values(MOCK_QUESTIONS).flat();

// Local test-question assignments store for offline demo
const localTestQuestions: {
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
const localAttemptsStore: Record<string, {
  attempt: TestAttempt;
  answers: Record<string, AttemptAnswerState>;
  result?: GradedResult;
}> = {};

export const api = {
  // Exams
  async getExams(): Promise<Exam[]> {
    if (!isSupabaseConfigured) return MOCK_EXAMS;
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error || !data || data.length === 0) return MOCK_EXAMS;
      return (data as ExamRow[]).map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: item.description ?? undefined,
        category: item.category,
        iconName: item.icon_name,
        bannerUrl: item.banner_url ?? undefined,
        orderIndex: item.order_index,
        isActive: item.is_active,
      }));
    } catch {
      return MOCK_EXAMS;
    }
  },

  async getExamBySlug(slug: string): Promise<Exam | null> {
    const exams = await this.getExams();
    return exams.find((e) => e.slug === slug || e.id === slug) || null;
  },

  // Subjects
  async getSubjects(examId: string): Promise<Subject[]> {
    if (!isSupabaseConfigured) return MOCK_SUBJECTS[examId] || [];
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('exam_id', examId)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error || !data || data.length === 0) return MOCK_SUBJECTS[examId] || [];
      return (data as SubjectRow[]).map((item) => ({
        id: item.id,
        examId: item.exam_id,
        name: item.name,
        slug: item.slug,
        description: item.description ?? undefined,
        iconName: item.icon_name,
        orderIndex: item.order_index,
        isActive: item.is_active,
      }));
    } catch {
      return MOCK_SUBJECTS[examId] || [];
    }
  },

  // Chapters
  async getChapters(subjectId: string): Promise<Chapter[]> {
    if (!isSupabaseConfigured) return MOCK_CHAPTERS[subjectId] || [];
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('subject_id', subjectId)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error || !data || data.length === 0) return MOCK_CHAPTERS[subjectId] || [];
      return (data as ChapterRow[]).map((item) => ({
        id: item.id,
        subjectId: item.subject_id,
        name: item.name,
        slug: item.slug,
        description: item.description ?? undefined,
        orderIndex: item.order_index,
        isActive: item.is_active,
      }));
    } catch {
      return MOCK_CHAPTERS[subjectId] || [];
    }
  },

  // Mock Tests (Student Catalog - Only active & published tests)
  async getTests(chapterId?: string, examId?: string): Promise<MockTest[]> {
    if (!isSupabaseConfigured) {
      return localTests.filter(t => 
        t.isActive && 
        (t.status === 'published' || !t.status) && 
        (!examId || t.examId === examId) && 
        (!chapterId || t.chapterId === chapterId)
      );
    }
    try {
      let query = supabase.from('tests').select('*').eq('is_active', true).eq('status', 'published');
      if (chapterId) query = query.eq('chapter_id', chapterId);
      if (examId) query = query.eq('exam_id', examId);
      const { data, error } = await query.order('order_index', { ascending: true });

      if (error || !data || data.length === 0) {
        return localTests.filter(t => 
          t.isActive && 
          (t.status === 'published' || !t.status) && 
          (!examId || t.examId === examId) && 
          (!chapterId || t.chapterId === chapterId)
        );
      }
      return (data as TestRow[]).map((item) => ({
        id: item.id,
        examId: item.exam_id,
        subjectId: item.subject_id ?? undefined,
        chapterId: item.chapter_id ?? undefined,
        testSeriesId: item.test_series_id ?? undefined,
        title: item.title,
        slug: item.slug,
        description: item.description ?? undefined,
        testType: item.test_type,
        durationMinutes: item.duration_minutes,
        totalQuestions: item.total_questions,
        totalMarks: Number(item.total_marks),
        passingMarks: Number(item.passing_marks),
        negativeMarking: Number(item.negative_marking),
        isPremium: item.is_premium,
        orderIndex: item.order_index,
        isActive: item.is_active,
        status: (item.status as 'draft' | 'published' | 'archived') || 'published',
      }));
    } catch {
      return localTests.filter(t => 
        t.isActive && 
        (t.status === 'published' || !t.status) && 
        (!examId || t.examId === examId) && 
        (!chapterId || t.chapterId === chapterId)
      );
    }
  },

  async getTestById(testId: string): Promise<MockTest | null> {
    const mockFound = localTests.find((t) => t.id === testId);
    if (!isSupabaseConfigured) return mockFound || null;

    try {
      const { data, error } = await supabase.from('tests').select('*').eq('id', testId).maybeSingle();
      if (error || !data) return mockFound || null;
      const row = data as TestRow;
      return {
        id: row.id,
        examId: row.exam_id,
        subjectId: row.subject_id ?? undefined,
        chapterId: row.chapter_id ?? undefined,
        testSeriesId: row.test_series_id ?? undefined,
        title: row.title,
        slug: row.slug,
        description: row.description ?? undefined,
        testType: row.test_type,
        durationMinutes: row.duration_minutes,
        totalQuestions: row.total_questions,
        totalMarks: Number(row.total_marks),
        passingMarks: Number(row.passing_marks),
        negativeMarking: Number(row.negative_marking),
        isPremium: row.is_premium,
        orderIndex: row.order_index,
        isActive: row.is_active,
        status: (row.status as 'draft' | 'published' | 'archived') || 'published',
      };
    } catch {
      return mockFound || null;
    }
  },

  // Questions for active exam (Sanitized without answers or explanations)
  async getStudentTestQuestions(testId: string): Promise<StudentTestQuestion[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).rpc('get_student_exam_questions', {
        p_test_id: testId,
      });
      if (error) {
        throw new Error(error.message || 'Failed to fetch exam questions');
      }
      if (Array.isArray(data)) {
        return data as StudentTestQuestion[];
      }
      return [];
    }

    // Local / Demo Fallback: Sanitize MOCK_QUESTIONS without answers
    const questions = MOCK_QUESTIONS[testId] || MOCK_QUESTIONS['test-indus-01'] || [];
    return questions.map((q, idx) => ({
      id: q.id,
      questionOrder: idx + 1,
      questionText: q.questionText,
      questionBengaliText: q.questionBengaliText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      marks: q.defaultMarks,
      negativeMarks: q.defaultNegativeMarks,
      difficulty: q.difficulty,
    }));
  },

  // Raw full questions (Internal or Post-submission)
  async getTestQuestions(testId: string): Promise<Question[]> {
    if (!isSupabaseConfigured) {
      return MOCK_QUESTIONS[testId] || MOCK_QUESTIONS['test-indus-01'] || [];
    }
    try {
      const { data, error } = await supabase
        .from('test_questions')
        .select(`
          question_order,
          marks,
          negative_marks,
          questions (
            id,
            chapter_id,
            question_text,
            question_bengali_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            explanation,
            explanation_bengali,
            difficulty,
            default_marks,
            default_negative_marks,
            is_active
          )
        `)
        .eq('test_id', testId)
        .order('question_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return MOCK_QUESTIONS[testId] || MOCK_QUESTIONS['test-indus-01'] || [];
      }

      return (data as unknown as Array<{
        question_order: number;
        marks: number;
        negative_marks: number;
        questions: Record<string, unknown>;
      }>).map((item) => {
        const q = item.questions;
        return {
          id: String(q.id),
          chapterId: q.chapter_id ? String(q.chapter_id) : undefined,
          questionText: String(q.question_text),
          questionBengaliText: q.question_bengali_text ? String(q.question_bengali_text) : undefined,
          optionA: String(q.option_a),
          optionB: String(q.option_b),
          optionC: String(q.option_c),
          optionD: String(q.option_d),
          correctOption: (q.correct_option as 'A' | 'B' | 'C' | 'D') || 'A',
          explanation: q.explanation ? String(q.explanation) : undefined,
          explanationBengali: q.explanation_bengali ? String(q.explanation_bengali) : undefined,
          difficulty: (q.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
          defaultMarks: Number(item.marks || q.default_marks || 1),
          defaultNegativeMarks: Number(item.negative_marks || q.default_negative_marks || 0.25),
          isActive: Boolean(q.is_active),
        };
      });
    } catch {
      return MOCK_QUESTIONS[testId] || MOCK_QUESTIONS['test-indus-01'] || [];
    }
  },

  // --------------------------------------------------------------------------
  // TEST ATTEMPT & GRADING ENGINE
  // --------------------------------------------------------------------------

  async startTestAttempt(testId: string): Promise<{
    attemptId: string;
    startTime: string;
    durationMinutes: number;
  }> {
    const test = await this.getTestById(testId);
    if (!test) throw new Error('Mock Test not found');

    const durationMinutes = test.durationMinutes;

    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).rpc('start_test_attempt', {
        p_test_id: testId,
      });

      if (error) {
        throw new Error(error.message || 'Failed to initialize exam session');
      }

      if (data && typeof data === 'object') {
        const res = data as { attempt_id: string; start_time: string; duration_minutes?: number };
        return {
          attemptId: res.attempt_id,
          startTime: res.start_time,
          durationMinutes: res.duration_minutes || durationMinutes,
        };
      }
    }

    // Local / Demo Fallback (Only active in development when Supabase is unconfigured)
    const existing = Object.values(localAttemptsStore).find(
      (a) => a.attempt.testId === testId && a.attempt.status === 'in_progress'
    );

    if (existing) {
      return {
        attemptId: existing.attempt.id,
        startTime: existing.attempt.startTime,
        durationMinutes,
      };
    }

    const attemptId = 'att-' + Date.now();
    const startTime = new Date().toISOString();

    localAttemptsStore[attemptId] = {
      attempt: {
        id: attemptId,
        userId: 'dev-student',
        testId,
        testTitle: test.title,
        status: 'in_progress',
        startTime,
        timeSpentSeconds: 0,
        score: 0,
        totalMarks: test.totalMarks,
        correctCount: 0,
        wrongCount: 0,
        skippedCount: 0,
        accuracy: 0,
        createdAt: startTime,
      },
      answers: {},
    };

    return { attemptId, startTime, durationMinutes };
  },

  async getTestAttempt(attemptId: string): Promise<TestAttempt | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any)
        .from('test_attempts')
        .select('*')
        .eq('id', attemptId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message || 'Failed to fetch test attempt');
      }

      if (data) {
        const d = data as AttemptRow;
        return {
          id: d.id,
          userId: d.user_id,
          testId: d.test_id,
          status: d.status as AttemptStatus,
          startTime: d.start_time,
          endTime: d.end_time ?? undefined,
          timeSpentSeconds: d.time_spent_seconds,
          score: d.score,
          totalMarks: d.total_marks,
          correctCount: d.correct_count,
          wrongCount: d.wrong_count,
          skippedCount: d.skipped_count,
          accuracy: d.accuracy,
          rank: d.rank ?? undefined,
          percentile: d.percentile ?? undefined,
          createdAt: d.created_at,
        };
      }
      return null;
    }

    return localAttemptsStore[attemptId]?.attempt || null;
  },

  async saveAnswers(
    attemptId: string,
    answers: AttemptAnswerState[],
    timeSpentSeconds: number
  ): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await (supabase as any).rpc('save_test_answers', {
          p_attempt_id: attemptId,
          p_answers: answers,
          p_time_spent_seconds: timeSpentSeconds,
        });
      } catch (err) {
        console.warn('Autosave RPC failed:', err);
      }
    }

    // Local in-memory sync
    if (localAttemptsStore[attemptId]) {
      localAttemptsStore[attemptId].attempt.timeSpentSeconds = timeSpentSeconds;
      answers.forEach((ans) => {
        localAttemptsStore[attemptId].answers[ans.questionId] = ans;
      });
    }

    // Persist in localStorage for complete page refresh recovery
    try {
      localStorage.setItem(`practicekoro_attempt_${attemptId}`, JSON.stringify({
        answers,
        timeSpentSeconds,
        updatedAt: Date.now(),
      }));
    } catch {
      // localStorage fallback
    }

    return true;
  },

  async submitTestAttempt(
    attemptId: string,
    answers: AttemptAnswerState[],
    timeSpentSeconds: number,
    testId: string
  ): Promise<GradedResult> {
    const test = await this.getTestById(testId);

    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).rpc('submit_test_attempt', {
        p_attempt_id: attemptId,
        p_answers: answers,
        p_time_spent_seconds: timeSpentSeconds,
      });

      if (error) {
        throw new Error(error.message || 'Submission failed on server');
      }

      if (data && typeof data === 'object') {
        const res = data as Record<string, unknown>;
        return {
          attemptId,
          testId,
          testTitle: test?.title,
          score: Number(res.score || 0),
          totalMarks: Number(res.total_marks || test?.totalMarks || 5),
          percentage: Number(res.percentage || 0),
          accuracy: Number(res.accuracy || 0),
          correctCount: Number(res.correct_count || 0),
          wrongCount: Number(res.wrong_count || 0),
          skippedCount: Number(res.skipped_count || 0),
          timeSpentSeconds,
          rank: res.rank !== undefined && res.rank !== null ? Number(res.rank) : null,
          totalCandidates: Number(res.total_candidates || 1),
          percentile: res.percentile !== undefined && res.percentile !== null ? Number(res.percentile) : null,
          passed: Boolean(res.passed),
        };
      }
    }

    // Local / Demo Authoritative fallback (only active when Supabase is unconfigured)
    const questions = MOCK_QUESTIONS[testId] || MOCK_QUESTIONS['test-indus-01'] || [];
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    let score = 0;

    const answersMap = new Map(answers.map((a) => [a.questionId, a.selectedOption]));

    questions.forEach((q) => {
      const selected = answersMap.get(q.id);
      const marksPerQ = q.defaultMarks || 1.0;
      const negMarks = q.defaultNegativeMarks || 0.25;

      if (!selected) {
        skippedCount++;
      } else if (selected === q.correctOption) {
        correctCount++;
        score += marksPerQ;
      } else {
        wrongCount++;
        score -= negMarks;

        // AUTOMATIC MISTAKES NOTEBOOK POPULATION (Local demo)
        const existingMistake = MOCK_MISTAKES.find((m) => m.questionId === q.id);
        if (existingMistake) {
          existingMistake.wrongCount++;
          existingMistake.isResolved = false;
          existingMistake.lastReviewedAt = new Date().toISOString();
        } else {
          MOCK_MISTAKES.unshift({
            id: 'mst-' + Date.now() + '-' + q.id.slice(-4),
            userId: 'dev-student',
            questionId: q.id,
            question: q,
            wrongCount: 1,
            isResolved: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    score = Math.max(0, score);
    const totalMarks = test ? test.totalMarks : 5;
    const attemptedCount = correctCount + wrongCount;
    const accuracy = attemptedCount > 0 ? Number(((correctCount / attemptedCount) * 100).toFixed(1)) : 0;
    const percentage = totalMarks > 0 ? Number(((score / totalMarks) * 100).toFixed(1)) : 0;
    const passed = score >= (test?.passingMarks || 2);

    const gradedResult: GradedResult = {
      attemptId,
      testId,
      testTitle: test?.title,
      score: Number(score.toFixed(2)),
      totalMarks,
      percentage,
      accuracy,
      correctCount,
      wrongCount,
      skippedCount,
      timeSpentSeconds,
      rank: null,
      totalCandidates: 1,
      percentile: null,
      passed,
    };

    // Store in localAttemptsStore
    localAttemptsStore[attemptId] = {
      attempt: {
        id: attemptId,
        userId: 'dev-student',
        testId,
        testTitle: test?.title,
        status: 'completed',
        startTime: new Date(Date.now() - timeSpentSeconds * 1000).toISOString(),
        endTime: new Date().toISOString(),
        timeSpentSeconds,
        score: gradedResult.score,
        totalMarks: gradedResult.totalMarks,
        correctCount,
        wrongCount,
        skippedCount,
        accuracy,
        rank: null,
        percentile: null,
        createdAt: new Date().toISOString(),
      },
      answers: Object.fromEntries(answers.map((a) => [a.questionId, a])),
      result: gradedResult,
    };

    // Clean up local cache
    try {
      localStorage.removeItem(`practicekoro_attempt_${attemptId}`);
    } catch {
      // ignore
    }

    return gradedResult;
  },

  async getAttemptResult(attemptId: string): Promise<GradedResult | null> {
    if (isSupabaseConfigured) {
      const { data: res, error } = await (supabase as any)
        .from('test_results')
        .select(`
          score,
          total_marks,
          percentage,
          accuracy,
          rank,
          total_candidates,
          percentile,
          passed,
          test_id,
          test_attempts (
            correct_count,
            wrong_count,
            skipped_count,
            time_spent_seconds
          ),
          tests (
            title
          )
        `)
        .eq('attempt_id', attemptId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message || 'Failed to fetch test result');
      }

      if (res) {
        const r = res as Record<string, any>;
        const attempt = r.test_attempts as {
          correct_count: number;
          wrong_count: number;
          skipped_count: number;
          time_spent_seconds: number;
        } | null;
        const test = r.tests as { title: string } | null;

        return {
          attemptId,
          testId: String(r.test_id),
          testTitle: test?.title,
          score: Number(r.score),
          totalMarks: Number(r.total_marks),
          percentage: Number(r.percentage || 0),
          accuracy: Number(r.accuracy || 0),
          correctCount: Number(attempt?.correct_count || 0),
          wrongCount: Number(attempt?.wrong_count || 0),
          skippedCount: Number(attempt?.skipped_count || 0),
          timeSpentSeconds: Number(attempt?.time_spent_seconds || 0),
          rank: r.rank !== null && r.rank !== undefined ? Number(r.rank) : null,
          totalCandidates: Number(r.total_candidates || 1),
          percentile: r.percentile !== null && r.percentile !== undefined ? Number(r.percentile) : null,
          passed: Boolean(r.passed),
        };
      }
      return null;
    }

    if (localAttemptsStore[attemptId]?.result) {
      return localAttemptsStore[attemptId].result!;
    }

    // Check attempts in mock list
    const attempt = MOCK_ATTEMPTS.find((a) => a.id === attemptId);
    if (attempt) {
      return {
        attemptId: attempt.id,
        testId: attempt.testId,
        testTitle: attempt.testTitle,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: Number(((attempt.score / attempt.totalMarks) * 100).toFixed(1)),
        accuracy: attempt.accuracy,
        correctCount: attempt.correctCount,
        wrongCount: attempt.wrongCount,
        skippedCount: attempt.skippedCount,
        timeSpentSeconds: attempt.timeSpentSeconds,
        rank: attempt.rank ?? null,
        totalCandidates: 1,
        percentile: attempt.percentile ?? null,
        passed: attempt.score >= 2,
      };
    }

    return null;
  },

  async getAttemptSolutions(attemptId: string, testId: string): Promise<QuestionSolution[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).rpc('get_attempt_solutions', {
        p_attempt_id: attemptId,
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch solutions');
      }

      if (Array.isArray(data)) {
        return data as QuestionSolution[];
      }
      return [];
    }

    // Local / Demo fallback
    const questions = MOCK_QUESTIONS[testId] || MOCK_QUESTIONS['test-indus-01'] || [];
    const answersMap = localAttemptsStore[attemptId]?.answers || {};

    return questions.map((q, idx) => {
      const ans = answersMap[q.id];
      const selected = ans?.selectedOption || null; // Strictly real answer or null; never guess
      const isCorrect = selected !== null && selected === q.correctOption;
      const marksAwarded = isCorrect ? q.defaultMarks : selected ? -q.defaultNegativeMarks : 0;

      return {
        id: q.id,
        questionOrder: idx + 1,
        questionText: q.questionText,
        questionBengaliText: q.questionBengaliText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        selectedOption: selected,
        correctOption: q.correctOption,
        isCorrect,
        marksAwarded,
        explanation: q.explanation,
        explanationBengali: q.explanationBengali,
        isBookmarked: MOCK_BOOKMARKS.some((b) => b.questionId === q.id),
      };
    });
  },

  async toggleBookmark(userId: string, questionId: string, note?: string): Promise<boolean> {
    const existingIndex = MOCK_BOOKMARKS.findIndex(
      (b) => b.questionId === questionId && b.userId === userId
    );

    if (existingIndex >= 0) {
      MOCK_BOOKMARKS.splice(existingIndex, 1);
      return false; // Removed
    } else {
      const q = Object.values(MOCK_QUESTIONS).flat().find((item) => item.id === questionId);
      if (q) {
        MOCK_BOOKMARKS.unshift({
          id: 'bm-' + Date.now(),
          userId,
          questionId,
          question: q,
          note: note || 'Bookmarked during mock test review',
          createdAt: new Date().toISOString(),
        });
      }
      return true; // Added
    }
  },

  // Attempts History
  async getUserAttempts(userId: string): Promise<TestAttempt[]> {
    // Merge any live session attempts with mock attempts
    const sessionAttempts = Object.values(localAttemptsStore)
      .filter((a) => a.attempt.userId === userId && a.attempt.status === 'completed')
      .map((a) => a.attempt);

    if (!isSupabaseConfigured) {
      const combined = [...sessionAttempts, ...MOCK_ATTEMPTS];
      const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());
      return unique;
    }

    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return MOCK_ATTEMPTS;
      return (data as AttemptRow[]).map((d) => ({
        id: d.id,
        userId: d.user_id,
        testId: d.test_id,
        status: d.status,
        startTime: d.start_time,
        endTime: d.end_time ?? undefined,
        timeSpentSeconds: d.time_spent_seconds,
        score: Number(d.score),
        totalMarks: Number(d.total_marks),
        correctCount: d.correct_count,
        wrongCount: d.wrong_count,
        skippedCount: d.skipped_count,
        accuracy: Number(d.accuracy),
        rank: d.rank ?? undefined,
        percentile: d.percentile ? Number(d.percentile) : undefined,
        createdAt: d.created_at,
      }));
    } catch {
      return MOCK_ATTEMPTS;
    }
  },

  // Mistakes
  async getMistakes(userId: string): Promise<MistakeItem[]> {
    if (!isSupabaseConfigured) return MOCK_MISTAKES.filter((m) => m.userId === userId || !m.userId);
    try {
      const { data, error } = await supabase
        .from('mistakes')
        .select(`
          id,
          user_id,
          question_id,
          wrong_count,
          is_resolved,
          last_reviewed_at,
          created_at,
          questions (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return MOCK_MISTAKES;
      return (data as unknown as Array<MistakeRow & { questions: Record<string, unknown> }>).map((d) => {
        const q = d.questions;
        return {
          id: d.id,
          userId: d.user_id,
          questionId: d.question_id,
          wrongCount: d.wrong_count,
          isResolved: d.is_resolved,
          lastReviewedAt: d.last_reviewed_at ?? undefined,
          createdAt: d.created_at,
          question: {
            id: String(q.id),
            questionText: String(q.question_text),
            questionBengaliText: q.question_bengali_text ? String(q.question_bengali_text) : undefined,
            optionA: String(q.option_a),
            optionB: String(q.option_b),
            optionC: String(q.option_c),
            optionD: String(q.option_d),
            correctOption: (q.correct_option as 'A' | 'B' | 'C' | 'D') || 'A',
            explanation: q.explanation ? String(q.explanation) : undefined,
            explanationBengali: q.explanation_bengali ? String(q.explanation_bengali) : undefined,
            difficulty: (q.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
            defaultMarks: Number(q.default_marks || 1),
            defaultNegativeMarks: Number(q.default_negative_marks || 0.25),
            isActive: Boolean(q.is_active),
          },
        };
      });
    } catch {
      return MOCK_MISTAKES;
    }
  },

  // Bookmarks
  async getBookmarks(userId: string): Promise<BookmarkItem[]> {
    if (!isSupabaseConfigured) return MOCK_BOOKMARKS.filter((b) => b.userId === userId || !b.userId);
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          id,
          user_id,
          question_id,
          note,
          created_at,
          questions (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return MOCK_BOOKMARKS;
      return (data as unknown as Array<BookmarkRow & { questions: Record<string, unknown> }>).map((d) => {
        const q = d.questions;
        return {
          id: d.id,
          userId: d.user_id,
          questionId: d.question_id,
          note: d.note ?? undefined,
          createdAt: d.created_at,
          question: {
            id: String(q.id),
            questionText: String(q.question_text),
            questionBengaliText: q.question_bengali_text ? String(q.question_bengali_text) : undefined,
            optionA: String(q.option_a),
            optionB: String(q.option_b),
            optionC: String(q.option_c),
            optionD: String(q.option_d),
            correctOption: (q.correct_option as 'A' | 'B' | 'C' | 'D') || 'A',
            explanation: q.explanation ? String(q.explanation) : undefined,
            explanationBengali: q.explanation_bengali ? String(q.explanation_bengali) : undefined,
            difficulty: (q.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
            defaultMarks: Number(q.default_marks || 1),
            defaultNegativeMarks: Number(q.default_negative_marks || 0.25),
            isActive: Boolean(q.is_active),
          },
        };
      });
    } catch {
      return MOCK_BOOKMARKS;
    }
  },

  // Subscription Plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    if (!isSupabaseConfigured) return MOCK_SUBSCRIPTION_PLANS;
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error || !data || data.length === 0) return MOCK_SUBSCRIPTION_PLANS;
      return (data as PlanRow[]).map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description ?? undefined,
        durationDays: d.duration_days,
        price: Number(d.price),
        originalPrice: d.original_price ? Number(d.original_price) : undefined,
        features: Array.isArray(d.features) ? (d.features as string[]) : [],
        isActive: d.is_active,
        orderIndex: d.order_index,
      }));
    } catch {
      return MOCK_SUBSCRIPTION_PLANS;
    }
  },

  // ==========================================
  // PHASE 3: ADMIN CONTENT MANAGEMENT API
  // ==========================================

  // Dashboard Statistics
  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase as any).rpc('get_admin_dashboard_counts');
        if (!error && data) {
          return {
            totalExams: Number(data.total_exams || 0),
            activeExams: Number(data.total_exams || 0),
            totalSubjects: Number(data.total_subjects || 0),
            totalChapters: Number(data.total_chapters || 0),
            totalTestSeries: Number(data.total_test_series || 0),
            totalTests: Number(data.total_tests || 0),
            publishedTests: Number(data.published_tests || 0),
            draftTests: Number(data.draft_tests || 0),
            archivedTests: Number(data.archived_tests || 0),
            totalQuestions: Number(data.total_questions || 0),
            activeQuestions: Number(data.total_questions || 0),
            totalAttempts: Number(data.total_attempts || 0),
            completedAttempts: Number(data.completed_attempts || 0),
            totalStudents: Number(data.total_students || 0),
          };
        }
      } catch (err) {
        console.warn('Fallback to local stats calculation', err);
      }
    }

    return {
      totalExams: localExams.length,
      activeExams: localExams.filter((e) => e.isActive).length,
      totalSubjects: localSubjects.length,
      totalChapters: localChapters.length,
      totalTestSeries: localTestSeries.length,
      totalTests: localTests.length,
      publishedTests: localTests.filter((t) => t.status === 'published').length,
      draftTests: localTests.filter((t) => t.status === 'draft').length,
      archivedTests: localTests.filter((t) => t.status === 'archived').length,
      totalQuestions: localQuestions.length,
      activeQuestions: localQuestions.filter((q) => q.isActive && q.status !== 'archived').length,
      totalAttempts: MOCK_ATTEMPTS.length,
      completedAttempts: MOCK_ATTEMPTS.filter((a) => a.status === 'completed').length,
      totalStudents: 142,
    };
  },

  // Admin: Exams
  async getAllAdminExams(): Promise<Exam[]> {
    if (!isSupabaseConfigured) {
      return localExams.map(e => ({
        ...e,
        subjectsCount: localSubjects.filter(s => s.examId === e.id).length,
        testsCount: localTests.filter(t => t.examId === e.id).length,
      }));
    }
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('order_index', { ascending: true });

      if (error || !data || data.length === 0) {
        return localExams.map(e => ({
          ...e,
          subjectsCount: localSubjects.filter(s => s.examId === e.id).length,
          testsCount: localTests.filter(t => t.examId === e.id).length,
        }));
      }

      return (data as ExamRow[]).map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: item.description ?? undefined,
        category: item.category,
        iconName: item.icon_name,
        bannerUrl: item.banner_url ?? undefined,
        orderIndex: item.order_index,
        isActive: item.is_active,
        subjectsCount: localSubjects.filter(s => s.examId === item.id).length,
        testsCount: localTests.filter(t => t.examId === item.id).length,
      }));
    } catch {
      return localExams;
    }
  },

  async createExam(examData: Omit<Exam, 'id'>): Promise<Exam> {
    const slug = examData.slug || examData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = slug || `exam-${Date.now()}`;
    const newExam: Exam = {
      id,
      ...examData,
      slug,
      subjectsCount: 0,
      testsCount: 0,
    };

    if (isSupabaseConfigured) {
      try {
        const { error } = await (supabase as any).from('exams').insert({
          id,
          title: newExam.title,
          slug: newExam.slug,
          description: newExam.description || null,
          category: newExam.category,
          icon_name: newExam.iconName || 'Shield',
          banner_url: newExam.bannerUrl || null,
          order_index: newExam.orderIndex || 0,
          is_active: newExam.isActive ?? true,
        });
        if (error) console.error('Supabase createExam error:', error);
      } catch (err) {
        console.error('Supabase createExam error:', err);
      }
    }

    localExams.push(newExam);
    return newExam;
  },

  async updateExam(id: string, updates: Partial<Exam>): Promise<Exam> {
    const existingIndex = localExams.findIndex(e => e.id === id);
    if (existingIndex !== -1) {
      localExams[existingIndex] = { ...localExams[existingIndex], ...updates };
    }

    if (isSupabaseConfigured) {
      try {
        const updatePayload: Record<string, unknown> = {};
        if (updates.title !== undefined) updatePayload.title = updates.title;
        if (updates.slug !== undefined) updatePayload.slug = updates.slug;
        if (updates.description !== undefined) updatePayload.description = updates.description;
        if (updates.category !== undefined) updatePayload.category = updates.category;
        if (updates.iconName !== undefined) updatePayload.icon_name = updates.iconName;
        if (updates.bannerUrl !== undefined) updatePayload.banner_url = updates.bannerUrl;
        if (updates.orderIndex !== undefined) updatePayload.order_index = updates.orderIndex;
        if (updates.isActive !== undefined) updatePayload.is_active = updates.isActive;

        await (supabase as any).from('exams').update(updatePayload).eq('id', id);
      } catch (err) {
        console.error('Supabase updateExam error:', err);
      }
    }

    return localExams[existingIndex] || { id, title: updates.title || '', slug: '', category: '', iconName: '', orderIndex: 0, isActive: true };
  },

  async deleteExam(id: string): Promise<boolean> {
    const idx = localExams.findIndex(e => e.id === id);
    if (idx !== -1) {
      localExams[idx].isActive = false;
    }

    if (isSupabaseConfigured) {
      try {
        await (supabase as any).from('exams').update({ is_active: false }).eq('id', id);
      } catch (err) {
        console.error('Supabase deleteExam error:', err);
      }
    }
    return true;
  },

  // Admin: Subjects
  async getAllAdminSubjects(examId?: string): Promise<Subject[]> {
    if (!isSupabaseConfigured) {
      return localSubjects
        .filter(s => !examId || s.examId === examId)
        .map(s => ({
          ...s,
          chaptersCount: localChapters.filter(c => c.subjectId === s.id).length,
        }));
    }
    try {
      let query = supabase.from('subjects').select('*').order('order_index', { ascending: true });
      if (examId) query = query.eq('exam_id', examId);
      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        return localSubjects.filter(s => !examId || s.examId === examId);
      }

      return (data as SubjectRow[]).map(item => ({
        id: item.id,
        examId: item.exam_id,
        name: item.name,
        slug: item.slug,
        description: item.description ?? undefined,
        iconName: item.icon_name,
        orderIndex: item.order_index,
        isActive: item.is_active,
        chaptersCount: localChapters.filter(c => c.subjectId === item.id).length,
      }));
    } catch {
      return localSubjects.filter(s => !examId || s.examId === examId);
    }
  },

  async createSubject(subjectData: Omit<Subject, 'id'>): Promise<Subject> {
    const slug = subjectData.slug || subjectData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `${subjectData.examId}-${slug}`.slice(0, 50);
    const newSubject: Subject = {
      id,
      ...subjectData,
      slug,
      chaptersCount: 0,
    };

    if (isSupabaseConfigured) {
      try {
        await (supabase as any).from('subjects').insert({
          id,
          exam_id: newSubject.examId,
          name: newSubject.name,
          slug: newSubject.slug,
          description: newSubject.description || null,
          icon_name: newSubject.iconName || 'BookOpen',
          order_index: newSubject.orderIndex || 0,
          is_active: newSubject.isActive ?? true,
        });
      } catch (err) {
        console.error('Supabase createSubject error:', err);
      }
    }

    localSubjects.push(newSubject);
    return newSubject;
  },

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject> {
    const idx = localSubjects.findIndex(s => s.id === id);
    if (idx !== -1) {
      localSubjects[idx] = { ...localSubjects[idx], ...updates };
    }

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, unknown> = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.slug !== undefined) payload.slug = updates.slug;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.iconName !== undefined) payload.icon_name = updates.iconName;
        if (updates.orderIndex !== undefined) payload.order_index = updates.orderIndex;
        if (updates.isActive !== undefined) payload.is_active = updates.isActive;

        await (supabase as any).from('subjects').update(payload).eq('id', id);
      } catch (err) {
        console.error('Supabase updateSubject error:', err);
      }
    }

    return localSubjects[idx] || { id, examId: '', name: '', slug: '', iconName: '', orderIndex: 0, isActive: true };
  },

  async deleteSubject(id: string): Promise<boolean> {
    const idx = localSubjects.findIndex(s => s.id === id);
    if (idx !== -1) {
      localSubjects[idx].isActive = false;
    }

    if (isSupabaseConfigured) {
      try {
        await (supabase as any).from('subjects').update({ is_active: false }).eq('id', id);
      } catch (err) {
        console.error('Supabase deleteSubject error:', err);
      }
    }
    return true;
  },

  // Admin: Chapters
  async getAllAdminChapters(subjectId?: string): Promise<Chapter[]> {
    if (!isSupabaseConfigured) {
      return localChapters
        .filter(c => !subjectId || c.subjectId === subjectId)
        .map(c => ({
          ...c,
          testsCount: localTests.filter(t => t.chapterId === c.id).length,
        }));
    }
    try {
      let query = supabase.from('chapters').select('*').order('order_index', { ascending: true });
      if (subjectId) query = query.eq('subject_id', subjectId);
      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        return localChapters.filter(c => !subjectId || c.subjectId === subjectId);
      }

      return (data as ChapterRow[]).map(item => ({
        id: item.id,
        subjectId: item.subject_id,
        name: item.name,
        slug: item.slug,
        description: item.description ?? undefined,
        orderIndex: item.order_index,
        isActive: item.is_active,
        testsCount: localTests.filter(t => t.chapterId === item.id).length,
      }));
    } catch {
      return localChapters.filter(c => !subjectId || c.subjectId === subjectId);
    }
  },

  async createChapter(chapterData: Omit<Chapter, 'id'>): Promise<Chapter> {
    const slug = chapterData.slug || chapterData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `${chapterData.subjectId}-${slug}`.slice(0, 50);
    const newChapter: Chapter = {
      id,
      ...chapterData,
      slug,
      testsCount: 0,
    };

    if (isSupabaseConfigured) {
      try {
        await (supabase as any).from('chapters').insert({
          id,
          subject_id: newChapter.subjectId,
          name: newChapter.name,
          slug: newChapter.slug,
          description: newChapter.description || null,
          order_index: newChapter.orderIndex || 0,
          is_active: newChapter.isActive ?? true,
        });
      } catch (err) {
        console.error('Supabase createChapter error:', err);
      }
    }

    localChapters.push(newChapter);
    return newChapter;
  },

  async updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter> {
    const idx = localChapters.findIndex(c => c.id === id);
    if (idx !== -1) {
      localChapters[idx] = { ...localChapters[idx], ...updates };
    }

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, unknown> = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.slug !== undefined) payload.slug = updates.slug;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.orderIndex !== undefined) payload.order_index = updates.orderIndex;
        if (updates.isActive !== undefined) payload.is_active = updates.isActive;

        await (supabase as any).from('chapters').update(payload).eq('id', id);
      } catch (err) {
        console.error('Supabase updateChapter error:', err);
      }
    }

    return localChapters[idx] || { id, subjectId: '', name: '', slug: '', orderIndex: 0, isActive: true };
  },

  async deleteChapter(id: string): Promise<boolean> {
    const idx = localChapters.findIndex(c => c.id === id);
    if (idx !== -1) {
      localChapters[idx].isActive = false;
    }

    if (isSupabaseConfigured) {
      try {
        await (supabase as any).from('chapters').update({ is_active: false }).eq('id', id);
      } catch (err) {
        console.error('Supabase deleteChapter error:', err);
      }
    }
    return true;
  },

  // Admin: Test Series
  async getTestSeries(examId?: string): Promise<TestSeries[]> {
    if (!isSupabaseConfigured) {
      return localTestSeries
        .filter(s => !examId || s.examId === examId)
        .map(s => {
          const exam = localExams.find(e => e.id === s.examId);
          return { ...s, examTitle: exam?.title };
        });
    }
    try {
      let query = supabase.from('test_series').select('*').order('order_index', { ascending: true });
      if (examId) query = query.eq('exam_id', examId);
      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        return localTestSeries.filter(s => !examId || s.examId === examId);
      }

      return (data as TestSeriesRow[]).map(item => {
        const exam = localExams.find(e => e.id === item.exam_id);
        return {
          id: item.id,
          examId: item.exam_id,
          title: item.title,
          slug: item.slug,
          description: item.description ?? undefined,
          isPremium: item.is_premium,
          orderIndex: item.order_index,
          isActive: item.is_active,
          createdAt: item.created_at,
          examTitle: exam?.title,
        };
      });
    } catch {
      return localTestSeries.filter(s => !examId || s.examId === examId);
    }
  },

  async createTestSeries(seriesData: Omit<TestSeries, 'id'>): Promise<TestSeries> {
    const slug = seriesData.slug || seriesData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `${seriesData.examId}-${slug}`.slice(0, 50);
    const exam = localExams.find(e => e.id === seriesData.examId);
    const newSeries: TestSeries = {
      id,
      ...seriesData,
      slug,
      examTitle: exam?.title,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await (supabase as any).from('test_series').insert({
          id,
          exam_id: newSeries.examId,
          title: newSeries.title,
          slug: newSeries.slug,
          description: newSeries.description || null,
          is_premium: newSeries.isPremium,
          order_index: newSeries.orderIndex || 0,
          is_active: newSeries.isActive ?? true,
        });
      } catch (err) {
        console.error('Supabase createTestSeries error:', err);
      }
    }

    localTestSeries.push(newSeries);
    return newSeries;
  },

  async updateTestSeries(id: string, updates: Partial<TestSeries>): Promise<TestSeries> {
    const idx = localTestSeries.findIndex(s => s.id === id);
    if (idx !== -1) {
      localTestSeries[idx] = { ...localTestSeries[idx], ...updates };
    }

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, unknown> = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.slug !== undefined) payload.slug = updates.slug;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.isPremium !== undefined) payload.is_premium = updates.isPremium;
        if (updates.orderIndex !== undefined) payload.order_index = updates.orderIndex;
        if (updates.isActive !== undefined) payload.is_active = updates.isActive;

        await (supabase as any).from('test_series').update(payload).eq('id', id);
      } catch (err) {
        console.error('Supabase updateTestSeries error:', err);
      }
    }

    return localTestSeries[idx] || { id, examId: '', title: '', slug: '', isPremium: false, orderIndex: 0, isActive: true };
  },

  async deleteTestSeries(id: string): Promise<boolean> {
    const idx = localTestSeries.findIndex(s => s.id === id);
    if (idx !== -1) {
      localTestSeries[idx].isActive = false;
    }

    if (isSupabaseConfigured) {
      try {
        await (supabase as any).from('test_series').update({ is_active: false }).eq('id', id);
      } catch (err) {
        console.error('Supabase deleteTestSeries error:', err);
      }
    }
    return true;
  },

  // Admin: All Tests (including draft & archived)
  async getAllAdminTests(filter?: {
    examId?: string;
    subjectId?: string;
    chapterId?: string;
    testSeriesId?: string;
    status?: string;
  }): Promise<MockTest[]> {
    let tests = [...localTests];

    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('tests').select('*').order('created_at', { ascending: false });
        if (filter?.examId) query = query.eq('exam_id', filter.examId);
        if (filter?.subjectId) query = query.eq('subject_id', filter.subjectId);
        if (filter?.chapterId) query = query.eq('chapter_id', filter.chapterId);
        if (filter?.testSeriesId) query = query.eq('test_series_id', filter.testSeriesId);
        if (filter?.status) query = query.eq('status', filter.status);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          tests = (data as TestRow[]).map(row => ({
            id: row.id,
            examId: row.exam_id,
            subjectId: row.subject_id ?? undefined,
            chapterId: row.chapter_id ?? undefined,
            testSeriesId: row.test_series_id ?? undefined,
            title: row.title,
            slug: row.slug,
            description: row.description ?? undefined,
            testType: row.test_type,
            durationMinutes: row.duration_minutes,
            totalQuestions: row.total_questions,
            totalMarks: Number(row.total_marks),
            passingMarks: Number(row.passing_marks),
            negativeMarking: Number(row.negative_marking),
            isPremium: row.is_premium,
            orderIndex: row.order_index,
            isActive: row.is_active,
            status: (row.status as 'draft' | 'published' | 'archived') || 'published',
          }));
        }
      } catch (err) {
        console.error('Supabase getAllAdminTests error:', err);
      }
    }

    if (filter) {
      if (filter.examId) tests = tests.filter(t => t.examId === filter.examId);
      if (filter.subjectId) tests = tests.filter(t => t.subjectId === filter.subjectId);
      if (filter.chapterId) tests = tests.filter(t => t.chapterId === filter.chapterId);
      if (filter.testSeriesId) tests = tests.filter(t => t.testSeriesId === filter.testSeriesId);
      if (filter.status) tests = tests.filter(t => t.status === filter.status);
    }

    return tests.map(t => {
      const exam = localExams.find(e => e.id === t.examId);
      const subject = localSubjects.find(s => s.id === t.subjectId);
      const chapter = localChapters.find(c => c.id === t.chapterId);
      const series = localTestSeries.find(s => s.id === t.testSeriesId);
      return {
        ...t,
        examTitle: exam?.title,
        subjectName: subject?.name,
        chapterName: chapter?.name,
        testSeriesTitle: series?.title,
      };
    });
  },

  async createTest(testData: Omit<MockTest, 'id' | 'status'> & { status?: 'draft' | 'published' | 'archived' }): Promise<MockTest> {
    const slug = testData.slug || testData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `test-${slug}-${Date.now().toString().slice(-4)}`;
    const newTest: MockTest = {
      id,
      ...testData,
      slug,
      status: testData.status || 'draft',
      isActive: testData.isActive ?? true,
    };

    if (isSupabaseConfigured) {
      try {
        await (supabase as any).from('tests').insert({
          id,
          exam_id: newTest.examId,
          subject_id: newTest.subjectId || null,
          chapter_id: newTest.chapterId || null,
          test_series_id: newTest.testSeriesId || null,
          title: newTest.title,
          slug: newTest.slug,
          description: newTest.description || null,
          test_type: newTest.testType,
          duration_minutes: newTest.durationMinutes,
          total_questions: newTest.totalQuestions || 0,
          total_marks: newTest.totalMarks || 0,
          passing_marks: newTest.passingMarks || 0,
          negative_marking: newTest.negativeMarking ?? 0.25,
          is_premium: newTest.isPremium ?? false,
          order_index: newTest.orderIndex || 0,
          is_active: newTest.isActive,
          status: newTest.status,
        });
      } catch (err) {
        console.error('Supabase createTest error:', err);
      }
    }

    localTests.unshift(newTest);
    return newTest;
  },

  async updateTest(id: string, updates: Partial<MockTest>): Promise<MockTest> {
    const idx = localTests.findIndex(t => t.id === id);
    if (idx !== -1) {
      localTests[idx] = { ...localTests[idx], ...updates };
    }

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, unknown> = {};
        if (updates.examId !== undefined) payload.exam_id = updates.examId;
        if (updates.subjectId !== undefined) payload.subject_id = updates.subjectId;
        if (updates.chapterId !== undefined) payload.chapter_id = updates.chapterId;
        if (updates.testSeriesId !== undefined) payload.test_series_id = updates.testSeriesId;
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.slug !== undefined) payload.slug = updates.slug;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.testType !== undefined) payload.test_type = updates.testType;
        if (updates.durationMinutes !== undefined) payload.duration_minutes = updates.durationMinutes;
        if (updates.totalQuestions !== undefined) payload.total_questions = updates.totalQuestions;
        if (updates.totalMarks !== undefined) payload.total_marks = updates.totalMarks;
        if (updates.passingMarks !== undefined) payload.passing_marks = updates.passingMarks;
        if (updates.negativeMarking !== undefined) payload.negative_marking = updates.negativeMarking;
        if (updates.isPremium !== undefined) payload.is_premium = updates.isPremium;
        if (updates.orderIndex !== undefined) payload.order_index = updates.orderIndex;
        if (updates.isActive !== undefined) payload.is_active = updates.isActive;
        if (updates.status !== undefined) payload.status = updates.status;

        await (supabase as any).from('tests').update(payload).eq('id', id);
      } catch (err) {
        console.error('Supabase updateTest error:', err);
      }
    }

    return localTests[idx] || (updates as MockTest);
  },

  async validateTestForPublish(testId: string): Promise<PublishValidationResult> {
    const errors: string[] = [];
    const test = localTests.find(t => t.id === testId);

    if (!test) {
      return { isValid: false, errors: ['Test not found.'] };
    }

    if (!test.examId) {
      errors.push('Exam must be selected.');
    }
    if (test.durationMinutes <= 0) {
      errors.push('Test duration must be greater than 0 minutes.');
    }
    if (test.totalMarks <= 0) {
      errors.push('Total marks must be greater than 0.');
    }

    // Check assigned questions
    const assignedQuestions = localTestQuestions.filter(tq => tq.testId === testId);

    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('test_questions')
          .select('question_id, question_order, questions(*)')
          .eq('test_id', testId);
        if (data && data.length > 0) {
          data.forEach((item: any, idx: number) => {
            const q = item.questions;
            if (!q) {
              errors.push(`Question #${idx + 1} data is missing.`);
            } else {
              if (!q.question_text || q.question_text.trim() === '') {
                errors.push(`Question #${idx + 1} has empty question text.`);
              }
              if (!q.option_a || !q.option_b || !q.option_c || !q.option_d) {
                errors.push(`Question #${idx + 1} must have all 4 options (A, B, C, D).`);
              }
              if (!['A', 'B', 'C', 'D'].includes(q.correct_option)) {
                errors.push(`Question #${idx + 1} has invalid or missing correct answer.`);
              }
            }
          });
          return { isValid: errors.length === 0, errors };
        } else if (data && data.length === 0) {
          errors.push('Test must have at least one question assigned before publishing.');
          return { isValid: false, errors };
        }
      } catch (err) {
        console.warn('Supabase validate error, falling back to local check', err);
      }
    }

    if (assignedQuestions.length === 0) {
      errors.push('Test must have at least one question assigned before publishing.');
    } else {
      assignedQuestions.forEach((tq, idx) => {
        const q = localQuestions.find(item => item.id === tq.questionId);
        if (!q) {
          errors.push(`Question #${idx + 1} (ID: ${tq.questionId}) not found in question bank.`);
        } else {
          if (!q.questionText || q.questionText.trim() === '') {
            errors.push(`Question #${idx + 1} has empty question text.`);
          }
          if (!q.optionA || !q.optionB || !q.optionC || !q.optionD) {
            errors.push(`Question #${idx + 1} is missing one or more options.`);
          }
          if (!['A', 'B', 'C', 'D'].includes(q.correctOption)) {
            errors.push(`Question #${idx + 1} does not have a valid correct answer key.`);
          }
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  async publishTest(testId: string): Promise<{ success: boolean; error?: string }> {
    const validation = await this.validateTestForPublish(testId);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Cannot publish test: ${validation.errors.join('; ')}`,
      };
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await (supabase as any).rpc('publish_test', { p_test_id: testId });
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err.message || 'Publish RPC failed' };
      }
    }

    const idx = localTests.findIndex(t => t.id === testId);
    if (idx !== -1) {
      localTests[idx].status = 'published';
      localTests[idx].isActive = true;
    }

    return { success: true };
  },

  async archiveTest(testId: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await (supabase as any).rpc('archive_test', { p_test_id: testId });
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err.message || 'Archive RPC failed' };
      }
    }

    const idx = localTests.findIndex(t => t.id === testId);
    if (idx !== -1) {
      localTests[idx].status = 'archived';
      localTests[idx].isActive = false;
    }

    return { success: true };
  },

  // Admin: Questions Bank
  async getAllAdminQuestions(filters?: {
    subjectId?: string;
    chapterId?: string;
    difficulty?: string;
    search?: string;
    status?: string;
  }): Promise<Question[]> {
    let questions = [...localQuestions];

    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('questions').select('*').order('created_at', { ascending: false });
        if (filters?.subjectId) query = query.eq('subject_id', filters.subjectId);
        if (filters?.chapterId) query = query.eq('chapter_id', filters.chapterId);
        if (filters?.difficulty) query = query.eq('difficulty', filters.difficulty);
        if (filters?.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          questions = (data as QuestionRow[]).map(q => ({
            id: q.id,
            chapterId: q.chapter_id ?? undefined,
            subjectId: q.subject_id ?? undefined,
            questionText: q.question_text,
            questionBengaliText: q.question_bengali_text ?? undefined,
            optionA: q.option_a,
            optionB: q.option_b,
            optionC: q.option_c,
            optionD: q.option_d,
            correctOption: (q.correct_option as 'A' | 'B' | 'C' | 'D') || 'A',
            explanation: q.explanation ?? undefined,
            explanationBengali: q.explanation_bengali ?? undefined,
            difficulty: (q.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
            defaultMarks: Number(q.default_marks || 1),
            defaultNegativeMarks: Number(q.default_negative_marks || 0.25),
            isActive: q.is_active,
            status: (q.status as 'active' | 'archived' | 'draft') || 'active',
          }));
        }
      } catch (err) {
        console.error('Supabase getAllAdminQuestions error:', err);
      }
    }

    if (filters) {
      if (filters.subjectId) questions = questions.filter(q => q.subjectId === filters.subjectId);
      if (filters.chapterId) questions = questions.filter(q => q.chapterId === filters.chapterId);
      if (filters.difficulty) questions = questions.filter(q => q.difficulty === filters.difficulty);
      if (filters.status) questions = questions.filter(q => q.status === filters.status);
      if (filters.search) {
        const term = filters.search.toLowerCase();
        questions = questions.filter(q =>
          q.questionText.toLowerCase().includes(term) ||
          (q.questionBengaliText && q.questionBengaliText.toLowerCase().includes(term))
        );
      }
    }

    return questions.map(q => {
      const subject = localSubjects.find(s => s.id === q.subjectId);
      const chapter = localChapters.find(c => c.id === q.chapterId);
      return {
        ...q,
        subjectName: subject?.name,
        chapterName: chapter?.name,
      };
    });
  },

  async getQuestionById(id: string): Promise<Question | null> {
    const mock = localQuestions.find(q => q.id === id);
    if (!isSupabaseConfigured) return mock || null;

    try {
      const { data, error } = await supabase.from('questions').select('*').eq('id', id).maybeSingle();
      if (error || !data) return mock || null;
      const q = data as QuestionRow;
      return {
        id: q.id,
        chapterId: q.chapter_id ?? undefined,
        subjectId: q.subject_id ?? undefined,
        questionText: q.question_text,
        questionBengaliText: q.question_bengali_text ?? undefined,
        optionA: q.option_a,
        optionB: q.option_b,
        optionC: q.option_c,
        optionD: q.option_d,
        correctOption: (q.correct_option as 'A' | 'B' | 'C' | 'D') || 'A',
        explanation: q.explanation ?? undefined,
        explanationBengali: q.explanation_bengali ?? undefined,
        difficulty: (q.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
        defaultMarks: Number(q.default_marks || 1),
        defaultNegativeMarks: Number(q.default_negative_marks || 0.25),
        isActive: q.is_active,
        status: (q.status as 'active' | 'archived' | 'draft') || 'active',
      };
    } catch {
      return mock || null;
    }
  },

  async createQuestion(qData: Omit<Question, 'id'>): Promise<Question> {
    const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newQuestion: Question = {
      id,
      ...qData,
      isActive: qData.isActive ?? true,
      status: qData.status || 'active',
    };

    if (isSupabaseConfigured) {
      try {
        await (supabase as any).from('questions').insert({
          id,
          chapter_id: newQuestion.chapterId || null,
          subject_id: newQuestion.subjectId || null,
          question_text: newQuestion.questionText,
          question_bengali_text: newQuestion.questionBengaliText || null,
          option_a: newQuestion.optionA,
          option_b: newQuestion.optionB,
          option_c: newQuestion.optionC,
          option_d: newQuestion.optionD,
          correct_option: newQuestion.correctOption,
          explanation: newQuestion.explanation || null,
          explanation_bengali: newQuestion.explanationBengali || null,
          difficulty: newQuestion.difficulty,
          default_marks: newQuestion.defaultMarks,
          default_negative_marks: newQuestion.defaultNegativeMarks,
          is_active: newQuestion.isActive,
          status: newQuestion.status,
        });
      } catch (err) {
        console.error('Supabase createQuestion error:', err);
      }
    }

    localQuestions.unshift(newQuestion);
    return newQuestion;
  },

  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
    const idx = localQuestions.findIndex(q => q.id === id);
    if (idx !== -1) {
      localQuestions[idx] = { ...localQuestions[idx], ...updates };
    }

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, unknown> = {};
        if (updates.questionText !== undefined) payload.question_text = updates.questionText;
        if (updates.questionBengaliText !== undefined) payload.question_bengali_text = updates.questionBengaliText;
        if (updates.optionA !== undefined) payload.option_a = updates.optionA;
        if (updates.optionB !== undefined) payload.option_b = updates.optionB;
        if (updates.optionC !== undefined) payload.option_c = updates.optionC;
        if (updates.optionD !== undefined) payload.option_d = updates.optionD;
        if (updates.correctOption !== undefined) payload.correct_option = updates.correctOption;
        if (updates.explanation !== undefined) payload.explanation = updates.explanation;
        if (updates.explanationBengali !== undefined) payload.explanation_bengali = updates.explanationBengali;
        if (updates.difficulty !== undefined) payload.difficulty = updates.difficulty;
        if (updates.defaultMarks !== undefined) payload.default_marks = updates.defaultMarks;
        if (updates.defaultNegativeMarks !== undefined) payload.default_negative_marks = updates.defaultNegativeMarks;
        if (updates.chapterId !== undefined) payload.chapter_id = updates.chapterId;
        if (updates.subjectId !== undefined) payload.subject_id = updates.subjectId;
        if (updates.isActive !== undefined) payload.is_active = updates.isActive;
        if (updates.status !== undefined) payload.status = updates.status;

        await (supabase as any).from('questions').update(payload).eq('id', id);
      } catch (err) {
        console.error('Supabase updateQuestion error:', err);
      }
    }

    return localQuestions[idx] || (updates as Question);
  },

  async archiveQuestion(id: string): Promise<boolean> {
    const idx = localQuestions.findIndex(q => q.id === id);
    if (idx !== -1) {
      localQuestions[idx].status = 'archived';
      localQuestions[idx].isActive = false;
    }

    if (isSupabaseConfigured) {
      try {
        await (supabase as any).from('questions').update({ status: 'archived', is_active: false }).eq('id', id);
      } catch (err) {
        console.error('Supabase archiveQuestion error:', err);
      }
    }
    return true;
  },

  async importQuestionsCSV(
    csvContent: string,
    defaultSubjectId?: string,
    defaultChapterId?: string
  ): Promise<{ successCount: number; errorCount: number; errors: string[] }> {
    const parsed = parseQuestionsCsv(csvContent, { defaultSubjectId, defaultChapterId });

    if (parsed.errors.length > 0 && parsed.questions.length === 0) {
      return {
        successCount: 0,
        errorCount: parsed.totalRows,
        errors: parsed.errors,
      };
    }

    let successCount = 0;
    const errors: string[] = [...parsed.errors];

    for (const qData of parsed.questions) {
      try {
        await this.createQuestion(qData);
        successCount++;
      } catch (err: any) {
        errors.push(`Failed to save question "${qData.questionText.slice(0, 30)}...": ${err.message}`);
      }
    }

    return {
      successCount,
      errorCount: parsed.invalidCount,
      errors,
    };
  },

  // Admin: Test Question Assignments & Ordering
  async getTestAssignedQuestions(testId: string): Promise<TestQuestionAssignment[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('test_questions')
          .select(`
            question_id,
            question_order,
            marks,
            negative_marks,
            questions (*)
          `)
          .eq('test_id', testId)
          .order('question_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((item: any) => {
            const q = item.questions;
            return {
              questionId: item.question_id,
              questionOrder: item.question_order,
              marks: Number(item.marks),
              negativeMarks: Number(item.negative_marks),
              questionText: q?.question_text,
              questionBengaliText: q?.question_bengali_text,
              difficulty: q?.difficulty,
              correctOption: q?.correct_option,
              optionA: q?.option_a,
              optionB: q?.option_b,
              optionC: q?.option_c,
              optionD: q?.option_d,
              explanation: q?.explanation,
            };
          });
        }
      } catch (err) {
        console.error('Supabase getTestAssignedQuestions error:', err);
      }
    }

    // Fallback in-memory
    const assignments = localTestQuestions
      .filter(tq => tq.testId === testId)
      .sort((a, b) => a.questionOrder - b.questionOrder);

    return assignments.map(a => {
      const q = localQuestions.find(item => item.id === a.questionId);
      return {
        questionId: a.questionId,
        questionOrder: a.questionOrder,
        marks: a.marks,
        negativeMarks: a.negativeMarks,
        questionText: q?.questionText,
        questionBengaliText: q?.questionBengaliText,
        difficulty: q?.difficulty,
        correctOption: q?.correctOption,
        optionA: q?.optionA,
        optionB: q?.optionB,
        optionC: q?.optionC,
        optionD: q?.optionD,
        explanation: q?.explanation,
      };
    });
  },

  async saveTestQuestions(
    testId: string,
    questions: { questionId: string; orderIndex: number; marks?: number; negativeMarks?: number }[]
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const payload = questions.map(q => ({
          question_id: q.questionId,
          order_index: q.orderIndex,
          marks: q.marks ?? 1.0,
          negative_marks: q.negativeMarks ?? 0.25,
        }));

        const { error } = await (supabase as any).rpc('save_test_questions', {
          p_test_id: testId,
          p_questions: payload,
        });

        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to save test questions RPC' };
      }
    }

    // Update in-memory fallback
    for (let i = localTestQuestions.length - 1; i >= 0; i--) {
      if (localTestQuestions[i].testId === testId) {
        localTestQuestions.splice(i, 1);
      }
    }

    let totalMarks = 0;
    questions.forEach((q, idx) => {
      const marks = q.marks ?? 1.0;
      const negMarks = q.negativeMarks ?? 0.25;
      totalMarks += marks;
      localTestQuestions.push({
        id: `tq-${testId}-${q.questionId}`,
        testId,
        questionId: q.questionId,
        questionOrder: q.orderIndex || (idx + 1),
        marks,
        negativeMarks: negMarks,
      });
    });

    const testIdx = localTests.findIndex(t => t.id === testId);
    if (testIdx !== -1) {
      localTests[testIdx].totalQuestions = questions.length;
      localTests[testIdx].totalMarks = totalMarks;
    }

    return { success: true };
  },
};
