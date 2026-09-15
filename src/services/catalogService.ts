import { supabaseRuntime as supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_EXAMS, MOCK_SUBJECTS, MOCK_CHAPTERS } from './mockData';
import { localTests } from './demoStore';
import type { Database } from '@/types/database';
import type { Exam, Subject, Chapter, MockTest } from '@/types';
type ExamRow = Database['public']['Tables']['exams']['Row'];
type SubjectRow = Database['public']['Tables']['subjects']['Row'];
type ChapterRow = Database['public']['Tables']['chapters']['Row'];
type TestRow = Database['public']['Tables']['tests']['Row'];
export const catalogService = {
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
      return localTests.filter(
        (t) =>
          t.isActive &&
          (t.status === 'published' || !t.status) &&
          (!examId || t.examId === examId) &&
          (!chapterId || t.chapterId === chapterId)
      );
    }
    try {
      let assocTestIds: string[] = [];
      if (examId) {
        try {
          const { data: assocData } = await supabase
            .from('test_exams')
            .select('test_id')
            .eq('exam_id', examId);
          if (assocData && assocData.length > 0) {
            assocTestIds = assocData.map((a) => a.test_id);
          }
        } catch (e) {
          console.warn('Could not query test_exams table, fallback to exam_id', e);
        }
      }

      let query = supabase
        .from('tests')
        .select('*, exams(title), subjects(name), chapters(name), test_series(title)')
        .eq('is_active', true)
        .eq('status', 'published');
      if (chapterId) query = query.eq('chapter_id', chapterId);
      if (examId) {
        if (assocTestIds.length > 0) {
          query = query.or(`id.in.(${assocTestIds.join(',')}),exam_id.eq.${examId}`);
        } else {
          query = query.eq('exam_id', examId);
        }
      }
      const { data, error } = await query.order('order_index', { ascending: true });

      if (error || !data || data.length === 0) {
        return localTests.filter(
          (t) =>
            t.isActive &&
            (t.status === 'published' || !t.status) &&
            (!examId || t.examId === examId) &&
            (!chapterId || t.chapterId === chapterId)
        );
      }
      return data.map((item) => ({
        id: item.id,
        examId: item.exam_id,
        subjectId: item.subject_id ?? undefined,
        chapterId: item.chapter_id ?? undefined,
        testSeriesId: item.test_series_id ?? undefined,
        title: item.title,
        slug: item.slug,
        description: item.description ?? undefined,
        testType: item.test_type,
        year: item.year ? Number(item.year) : undefined,
        durationMinutes: item.duration_minutes,
        totalQuestions: item.total_questions,
        totalMarks: Number(item.total_marks),
        passingMarks: Number(item.passing_marks),
        negativeMarking: Number(item.negative_marking),
        isPremium: item.is_premium,
        orderIndex: item.order_index,
        isActive: item.is_active,
        status: (item.status as 'draft' | 'published' | 'archived') || 'published',
        examTitle: item.exams?.title,
        subjectName: item.subjects?.name,
        chapterName: item.chapters?.name,
        testSeriesTitle: item.test_series?.title,
      }));
    } catch {
      return localTests.filter(
        (t) =>
          t.isActive &&
          (t.status === 'published' || !t.status) &&
          (!examId || t.examId === examId) &&
          (!chapterId || t.chapterId === chapterId)
      );
    }
  },

  // Exam-centric tests helper
  async getTestsForExam(
    examId: string,
    category?: 'full_mock' | 'pyq' | 'topic'
  ): Promise<MockTest[]> {
    const allTests = await this.getTests(undefined, examId);
    if (!category) return allTests;

    if (category === 'full_mock') {
      return allTests.filter((t) => t.testType === 'full_mock');
    }
    if (category === 'pyq') {
      return allTests.filter((t) => t.testType === 'pyq');
    }
    if (category === 'topic') {
      return allTests.filter(
        (t) =>
          t.testType === 'topic' || t.testType === 'chapter_mock' || t.testType === 'subject_mock'
      );
    }
    return allTests;
  },

  async getTestExamAssociations(testId: string): Promise<string[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('test_exams')
        .select('exam_id')
        .eq('test_id', testId);
      if (error || !data) return [];
      return data.map((d) => d.exam_id);
    } catch {
      return [];
    }
  },

  async associateTestWithExam(testId: string, examId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase
        .from('test_exams')
        .upsert({ test_id: testId, exam_id: examId }, { onConflict: 'test_id,exam_id' });
      return !error;
    } catch {
      return false;
    }
  },

  async dissociateTestFromExam(testId: string, examId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase
        .from('test_exams')
        .delete()
        .eq('test_id', testId)
        .eq('exam_id', examId);
      return !error;
    } catch {
      return false;
    }
  },

  async syncTestExamAssociations(testId: string, examIds: string[]): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    try {
      const { error: delError } = await supabase.from('test_exams').delete().eq('test_id', testId);
      if (delError) return false;

      if (examIds.length > 0) {
        const rows = examIds.map((eid) => ({ test_id: testId, exam_id: eid }));
        const { error: insError } = await supabase.from('test_exams').insert(rows);
        if (insError) return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  async getTestById(testId: string): Promise<MockTest | null> {
    const mockFound = localTests.find((t) => t.id === testId);
    if (!isSupabaseConfigured) return mockFound || null;

    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .maybeSingle();
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
        year: 'year' in row && row.year ? Number(row.year) : undefined,
        durationMinutes: row.duration_minutes,
        totalQuestions: row.total_questions,
        totalMarks: Number(row.total_marks),
        passingMarks: Number(row.passing_marks),
        negativeMarking: Number(row.negative_marking),
        isPremium: row.is_premium,
        orderIndex: row.order_index,
        isActive: row.is_active,
        status: row.status || 'published',
      };
    } catch {
      return mockFound || null;
    }
  },
};
