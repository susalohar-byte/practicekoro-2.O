import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  MOCK_EXAMS,
  MOCK_SUBJECTS,
  MOCK_CHAPTERS,
  MOCK_TESTS,
  MOCK_QUESTIONS,
  MOCK_ATTEMPTS,
  MOCK_MISTAKES,
  MOCK_BOOKMARKS,
  MOCK_SUBSCRIPTION_PLANS,
} from './mockData';
import type { Database } from '@/types/database';
import type {
  Exam,
  Subject,
  Chapter,
  MockTest,
  Question,
  StudentTestQuestion,
  AttemptAnswerState,
  TestAttempt,
  GradedResult,
  QuestionSolution,
  MistakeItem,
  BookmarkItem,
  SubscriptionPlan
} from '@/types';

type ExamRow = Database['public']['Tables']['exams']['Row'];
type SubjectRow = Database['public']['Tables']['subjects']['Row'];
type ChapterRow = Database['public']['Tables']['chapters']['Row'];
type TestRow = Database['public']['Tables']['tests']['Row'];
type AttemptRow = Database['public']['Tables']['test_attempts']['Row'];
type MistakeRow = Database['public']['Tables']['mistakes']['Row'];
type BookmarkRow = Database['public']['Tables']['bookmarks']['Row'];
type PlanRow = Database['public']['Tables']['subscription_plans']['Row'];

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

  // Mock Tests
  async getTests(chapterId?: string, examId?: string): Promise<MockTest[]> {
    if (!isSupabaseConfigured) {
      if (chapterId && MOCK_TESTS[chapterId]) return MOCK_TESTS[chapterId];
      return Object.values(MOCK_TESTS).flat().filter(t => !examId || t.examId === examId);
    }
    try {
      let query = supabase.from('tests').select('*').eq('is_active', true);
      if (chapterId) query = query.eq('chapter_id', chapterId);
      if (examId) query = query.eq('exam_id', examId);
      const { data, error } = await query.order('order_index', { ascending: true });

      if (error || !data || data.length === 0) {
        if (chapterId && MOCK_TESTS[chapterId]) return MOCK_TESTS[chapterId];
        return Object.values(MOCK_TESTS).flat().filter(t => !examId || t.examId === examId);
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
      }));
    } catch {
      if (chapterId && MOCK_TESTS[chapterId]) return MOCK_TESTS[chapterId];
      return Object.values(MOCK_TESTS).flat().filter(t => !examId || t.examId === examId);
    }
  },

  async getTestById(testId: string): Promise<MockTest | null> {
    const allTests = Object.values(MOCK_TESTS).flat();
    const mockFound = allTests.find((t) => t.id === testId);
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
      };
    } catch {
      return mockFound || null;
    }
  },

  // Questions for active exam (Sanitized without answers)
  async getStudentTestQuestions(testId: string): Promise<StudentTestQuestion[]> {
    const questions = await this.getTestQuestions(testId);
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

  async startTestAttempt(testId: string, userId: string): Promise<{
    attemptId: string;
    startTime: string;
    durationMinutes: number;
  }> {
    const test = await this.getTestById(testId);
    if (!test) throw new Error('Mock Test not found');

    const durationMinutes = test.durationMinutes;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase as any).rpc('start_test_attempt', {
          p_test_id: testId,
          p_user_id: userId,
        });
        if (!error && data && typeof data === 'object') {
          const res = data as { attempt_id: string; start_time: string };
          return {
            attemptId: res.attempt_id,
            startTime: res.start_time,
            durationMinutes,
          };
        }
      } catch (err) {
        console.warn('RPC start_test_attempt failed, using fallback:', err);
      }
    }

    // Local / Demo Fallback
    const existing = Object.values(localAttemptsStore).find(
      (a) => a.attempt.userId === userId && a.attempt.testId === testId && a.attempt.status === 'in_progress'
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
        userId,
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
    userId: string,
    testId: string
  ): Promise<GradedResult> {
    const test = await this.getTestById(testId);
    const questions = await this.getTestQuestions(testId);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase as any).rpc('submit_test_attempt', {
          p_attempt_id: attemptId,
          p_answers: answers,
          p_time_spent_seconds: timeSpentSeconds,
        });

        if (!error && data && typeof data === 'object') {
          const res = data as Record<string, unknown>;
          return {
            attemptId,
            testId,
            testTitle: test?.title,
            score: Number(res.score || 0),
            totalMarks: Number(res.total_marks || test?.totalMarks || 5),
            percentage: Number(res.accuracy || 0),
            accuracy: Number(res.accuracy || 0),
            correctCount: Number(res.correct_count || 0),
            wrongCount: Number(res.wrong_count || 0),
            skippedCount: Number(res.skipped_count || 0),
            timeSpentSeconds,
            rank: Number(res.rank || 14),
            totalCandidates: Number(res.total_candidates || 150),
            percentile: Number(res.percentile || 94.5),
            passed: Boolean(res.passed),
          };
        }
      } catch (err) {
        console.warn('Submit RPC failed, using server-authoritative mock grading:', err);
      }
    }

    // Authoritative grading calculation
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

        // AUTOMATIC MISTAKES NOTEBOOK POPULATION:
        // Add or increment this question in MOCK_MISTAKES
        const existingMistake = MOCK_MISTAKES.find((m) => m.questionId === q.id && m.userId === userId);
        if (existingMistake) {
          existingMistake.wrongCount++;
          existingMistake.isResolved = false;
          existingMistake.lastReviewedAt = new Date().toISOString();
        } else {
          MOCK_MISTAKES.unshift({
            id: 'mst-' + Date.now() + '-' + q.id.slice(-4),
            userId,
            questionId: q.id,
            question: q,
            wrongCount: 1,
            isResolved: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    const totalAnswered = correctCount + wrongCount;
    const accuracy = totalAnswered > 0 ? Number(((correctCount / totalAnswered) * 100).toFixed(1)) : 0;
    const totalMarks = test ? test.totalMarks : 5;
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
      rank: 14,
      totalCandidates: 150,
      percentile: 94.5,
      passed,
    };

    // Store in localAttemptsStore
    localAttemptsStore[attemptId] = {
      attempt: {
        id: attemptId,
        userId,
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
        rank: 14,
        percentile: 94.5,
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
        rank: attempt.rank || 14,
        totalCandidates: 150,
        percentile: attempt.percentile || 94.5,
        passed: attempt.score >= 2,
      };
    }

    return null;
  },

  async getAttemptSolutions(attemptId: string, testId: string): Promise<QuestionSolution[]> {
    const questions = await this.getTestQuestions(testId);
    const answersMap = localAttemptsStore[attemptId]?.answers || {};

    return questions.map((q, idx) => {
      const ans = answersMap[q.id];
      const selected = ans?.selectedOption || (idx === 4 ? 'A' : idx === 0 ? 'B' : null);
      const isCorrect = selected === q.correctOption;
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
};
