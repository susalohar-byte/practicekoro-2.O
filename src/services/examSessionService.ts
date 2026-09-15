import { supabaseRuntime as supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_QUESTIONS, MOCK_ATTEMPTS, MOCK_MISTAKES, MOCK_BOOKMARKS } from './mockData';
import { localAttemptsStore } from './demoStore';
import { catalogService } from './catalogService';
import type { Database, AttemptStatus } from '@/types/database';
import type {
  Question,
  StudentTestQuestion,
  AttemptAnswerState,
  TestAttempt,
  GradedResult,
  QuestionSolution,
  MistakeItem,
  BookmarkItem,
} from '@/types';
import { calculateScore } from '@/utils/scoring';
type QuestionRow = Database['public']['Tables']['questions']['Row'];
type QuestionWithContext = QuestionRow & {
  chapters: {
    name: string;
    subjects: { name: string; exams: { title: string } | null } | null;
  } | null;
};
type AttemptRow = Database['public']['Tables']['test_attempts']['Row'];
type MistakeRow = Database['public']['Tables']['mistakes']['Row'];
type BookmarkRow = Database['public']['Tables']['bookmarks']['Row'];
export const examSessionService = {
  // Questions for active exam (Sanitized without answers or explanations)
  async getStudentTestQuestions(testId: string): Promise<StudentTestQuestion[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('get_student_exam_questions', {
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
        .select(
          `
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
        `
        )
        .eq('test_id', testId)
        .order('question_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return MOCK_QUESTIONS[testId] || MOCK_QUESTIONS['test-indus-01'] || [];
      }

      return (
        data as unknown as Array<{
          question_order: number;
          marks: number;
          negative_marks: number;
          questions: Record<string, unknown>;
        }>
      ).map((item) => {
        const q = item.questions as unknown as QuestionRow;
        return {
          id: String(q.id),
          chapterId: q.chapter_id ? String(q.chapter_id) : undefined,
          questionText: String(q.question_text),
          questionBengaliText: q.question_bengali_text
            ? String(q.question_bengali_text)
            : undefined,
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
    const test = await catalogService.getTestById(testId);
    if (!test) throw new Error('Mock Test not found');

    const durationMinutes = test.durationMinutes;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('start_test_attempt', {
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
      const { data, error } = await supabase
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
        await supabase.rpc('save_test_answers', {
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
      localStorage.setItem(
        `practicekoro_attempt_${attemptId}`,
        JSON.stringify({
          answers,
          timeSpentSeconds,
          updatedAt: Date.now(),
        })
      );
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
    const test = await catalogService.getTestById(testId);

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('submit_test_attempt', {
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
          percentile:
            res.percentile !== undefined && res.percentile !== null ? Number(res.percentile) : null,
          passed: Boolean(res.passed),
        };
      }
    }

    // Local / Demo Authoritative fallback (only active when Supabase is unconfigured)
    const questions = MOCK_QUESTIONS[testId] || MOCK_QUESTIONS['test-indus-01'] || [];
    const answersMap = new Map(answers.map((a) => [a.questionId, a.selectedOption]));
    const totalMarks = test ? test.totalMarks : 5;
    const passingMarks = test?.passingMarks || 2;
    const scoreSummary = calculateScore(
      questions.map((q) => ({
        id: q.id,
        correctOption: q.correctOption,
        marks: q.defaultMarks || 1,
        negativeMarks: q.defaultNegativeMarks || 0.25,
      })),
      answers,
      totalMarks,
      passingMarks
    );

    // AUTOMATIC MISTAKES NOTEBOOK POPULATION (Local demo)
    questions.forEach((q) => {
      const selected = answersMap.get(q.id);
      if (selected && selected !== q.correctOption) {
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

    const gradedResult: GradedResult = {
      attemptId,
      testId,
      testTitle: test?.title,
      score: scoreSummary.score,
      totalMarks,
      percentage: scoreSummary.percentage,
      accuracy: scoreSummary.accuracy,
      correctCount: scoreSummary.correctCount,
      wrongCount: scoreSummary.wrongCount,
      skippedCount: scoreSummary.skippedCount,
      timeSpentSeconds,
      rank: null,
      totalCandidates: 1,
      percentile: null,
      passed: scoreSummary.passed,
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
        correctCount: scoreSummary.correctCount,
        wrongCount: scoreSummary.wrongCount,
        skippedCount: scoreSummary.skippedCount,
        accuracy: scoreSummary.accuracy,
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
      const { data: res, error } = await supabase
        .from('test_results')
        .select(
          `
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
        `
        )
        .eq('attempt_id', attemptId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message || 'Failed to fetch test result');
      }

      if (res) {
        const r = res as Record<string, unknown>;
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
          percentile:
            r.percentile !== null && r.percentile !== undefined ? Number(r.percentile) : null,
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
      const { data, error } = await supabase.rpc('get_attempt_solutions', {
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
    if (isSupabaseConfigured) {
      try {
        const { data: existing } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', userId)
          .eq('question_id', questionId)
          .maybeSingle();

        if (existing) {
          await supabase.from('bookmarks').delete().eq('id', existing.id);
          return false; // Removed
        } else {
          await supabase.from('bookmarks').insert({
            user_id: userId,
            question_id: questionId,
            note: note || 'Bookmarked during practice review',
          });
          return true; // Added
        }
      } catch (err) {
        console.error('Supabase toggleBookmark error:', err);
      }
    }

    const existingIndex = MOCK_BOOKMARKS.findIndex(
      (b) => b.questionId === questionId && b.userId === userId
    );

    if (existingIndex >= 0) {
      MOCK_BOOKMARKS.splice(existingIndex, 1);
      return false; // Removed
    } else {
      const q = Object.values(MOCK_QUESTIONS)
        .flat()
        .find((item) => item.id === questionId);
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
    // Merge any live session attempts with mock attempts if not on Supabase
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
        .select(
          `
          *,
          tests (
            title,
            duration_minutes,
            total_questions,
            total_marks,
            is_premium,
            test_type,
            year,
            exams (title),
            subjects (name),
            chapters (name)
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return [];
      return data.map((d) => {
        const test = d.tests;
        return {
          id: d.id,
          userId: d.user_id,
          testId: d.test_id,
          testTitle: test?.title || d.test_id,
          examTitle: test?.exams?.title,
          subjectName: test?.subjects?.name,
          chapterName: test?.chapters?.name,
          durationMinutes: test?.duration_minutes ? Number(test.duration_minutes) : undefined,
          totalQuestions: test?.total_questions ? Number(test.total_questions) : undefined,
          isPremium: Boolean(test?.is_premium),
          testType: test?.test_type,
          year: test?.year ? Number(test.year) : undefined,
          status: d.status,
          startTime: d.start_time,
          endTime: d.end_time ?? undefined,
          timeSpentSeconds: d.time_spent_seconds,
          score: Number(d.score),
          totalMarks: Number(d.total_marks || test?.total_marks || 0),
          correctCount: d.correct_count,
          wrongCount: d.wrong_count,
          skippedCount: d.skipped_count,
          accuracy: Number(d.accuracy),
          rank: d.rank ?? undefined,
          percentile: d.percentile ? Number(d.percentile) : undefined,
          createdAt: d.created_at,
        };
      });
    } catch {
      return [];
    }
  },

  // Mistakes
  async getMistakes(userId: string): Promise<MistakeItem[]> {
    if (!isSupabaseConfigured) return MOCK_MISTAKES.filter((m) => m.userId === userId || !m.userId);
    try {
      const { data, error } = await supabase
        .from('mistakes')
        .select(
          `
          id,
          user_id,
          question_id,
          wrong_count,
          is_resolved,
          last_reviewed_at,
          created_at,
          questions (
            *,
            chapters (
              name,
              subjects (
                name,
                exams (title)
              )
            )
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return [];
      return (
        data as unknown as Array<
          MistakeRow & {
            questions: Database['public']['Tables']['questions']['Row'] & { chapters?: unknown };
          }
        >
      ).map((d) => {
        const q = (d.questions ?? {}) as unknown as Partial<QuestionWithContext>;
        const ch = q.chapters;
        const sub = ch?.subjects;
        const ex = sub?.exams;
        return {
          id: d.id,
          userId: d.user_id,
          questionId: d.question_id,
          wrongCount: d.wrong_count,
          isResolved: d.is_resolved,
          lastReviewedAt: d.last_reviewed_at ?? undefined,
          createdAt: d.created_at,
          examTitle: ex?.title,
          subjectName: sub?.name,
          chapterName: ch?.name,
          question: {
            id: String(q.id),
            chapterId: q.chapter_id ?? undefined,
            subjectId: q.subject_id ?? undefined,
            questionText: String(q.question_text),
            questionBengaliText: q.question_bengali_text
              ? String(q.question_bengali_text)
              : undefined,
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
            examTitle: ex?.title,
            subjectName: sub?.name,
            chapterName: ch?.name,
          },
        };
      });
    } catch {
      return [];
    }
  },

  // Resolve or unresolve a mistake
  async resolveMistake(mistakeId: string, isResolved: boolean = true): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('mistakes')
          .update({
            is_resolved: isResolved,
            last_reviewed_at: new Date().toISOString(),
          })
          .eq('id', mistakeId);
        if (!error) return true;
      } catch (err) {
        console.error('resolveMistake Supabase error:', err);
      }
    }
    const idx = MOCK_MISTAKES.findIndex((m) => m.id === mistakeId);
    if (idx !== -1) {
      MOCK_MISTAKES[idx].isResolved = isResolved;
      MOCK_MISTAKES[idx].lastReviewedAt = new Date().toISOString();
      return true;
    }
    return false;
  },

  // Bookmarks
  async getBookmarks(userId: string): Promise<BookmarkItem[]> {
    if (!isSupabaseConfigured)
      return MOCK_BOOKMARKS.filter((b) => b.userId === userId || !b.userId);
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select(
          `
          id,
          user_id,
          question_id,
          note,
          created_at,
          questions (
            *,
            chapters (
              name,
              subjects (
                name,
                exams (title)
              )
            )
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return [];
      return (
        data as unknown as Array<
          BookmarkRow & {
            questions: Database['public']['Tables']['questions']['Row'] & { chapters?: unknown };
          }
        >
      ).map((d) => {
        const q = (d.questions ?? {}) as unknown as Partial<QuestionWithContext>;
        const ch = q.chapters;
        const sub = ch?.subjects;
        const ex = sub?.exams;
        return {
          id: d.id,
          userId: d.user_id,
          questionId: d.question_id,
          note: d.note ?? undefined,
          createdAt: d.created_at,
          examTitle: ex?.title,
          subjectName: sub?.name,
          chapterName: ch?.name,
          question: {
            id: String(q.id),
            chapterId: q.chapter_id ?? undefined,
            subjectId: q.subject_id ?? undefined,
            questionText: String(q.question_text),
            questionBengaliText: q.question_bengali_text
              ? String(q.question_bengali_text)
              : undefined,
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
            examTitle: ex?.title,
            subjectName: sub?.name,
            chapterName: ch?.name,
          },
        };
      });
    } catch {
      return [];
    }
  },
};
