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
import type { Exam, Subject, Chapter, MockTest, Question, TestAttempt, MistakeItem, BookmarkItem, SubscriptionPlan } from '@/types';

type ExamRow = Database['public']['Tables']['exams']['Row'];
type SubjectRow = Database['public']['Tables']['subjects']['Row'];
type ChapterRow = Database['public']['Tables']['chapters']['Row'];
type TestRow = Database['public']['Tables']['tests']['Row'];
type AttemptRow = Database['public']['Tables']['test_attempts']['Row'];
type MistakeRow = Database['public']['Tables']['mistakes']['Row'];
type BookmarkRow = Database['public']['Tables']['bookmarks']['Row'];
type PlanRow = Database['public']['Tables']['subscription_plans']['Row'];

export const api = {
  // Exams
  async getExams(): Promise<Exam[]> {
    if (!isSupabaseConfigured) {
      return MOCK_EXAMS;
    }
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error || !data || data.length === 0) {
        return MOCK_EXAMS;
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
    if (!isSupabaseConfigured) {
      return MOCK_SUBJECTS[examId] || [];
    }
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('exam_id', examId)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error || !data || data.length === 0) {
        return MOCK_SUBJECTS[examId] || [];
      }
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
    if (!isSupabaseConfigured) {
      return MOCK_CHAPTERS[subjectId] || [];
    }
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('subject_id', subjectId)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error || !data || data.length === 0) {
        return MOCK_CHAPTERS[subjectId] || [];
      }
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
      if (chapterId && MOCK_TESTS[chapterId]) {
        return MOCK_TESTS[chapterId];
      }
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

  // Questions
  async getTestQuestions(testId: string): Promise<Question[]> {
    if (!isSupabaseConfigured) {
      return MOCK_QUESTIONS[testId] || [];
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
        return MOCK_QUESTIONS[testId] || [];
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
      return MOCK_QUESTIONS[testId] || [];
    }
  },

  // Attempts
  async getUserAttempts(userId: string): Promise<TestAttempt[]> {
    if (!isSupabaseConfigured) return MOCK_ATTEMPTS;
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
    if (!isSupabaseConfigured) return MOCK_MISTAKES;
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
    if (!isSupabaseConfigured) return MOCK_BOOKMARKS;
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
