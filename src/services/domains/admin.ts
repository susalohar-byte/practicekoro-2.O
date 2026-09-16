import { getErrorMessage } from '@/lib/errors';
import { supabaseRuntime as supabase, isSupabaseConfigured } from '@/lib/supabase';
import type {
  Exam,
  Subject,
  Chapter,
  TestSeries,
  MockTest,
  Question,
  TestQuestionAssignment,
  PublishValidationResult,
} from '@/types';
import { parseQuestionsCsv, parseQuestionsText } from '@/utils/csvParser';
import {
  localExams,
  localSubjects,
  localChapters,
  localTestSeries,
  localTests,
  localQuestions,
  localTestQuestions,
} from '@/services/domains/localStore';
import type {
  ChapterRow,
  ExamRow,
  QuestionRow,
  SubjectRow,
  TestRow,
} from '@/services/domains/localStore';
import { catalogApi } from '@/services/domains/catalog';

/**
 * Admin content-management API (exams, subjects, chapters, series, tests, questions).
 * Methods extracted verbatim from the original src/services/api.ts.
 */

export const adminApi = {
  // Per-exam content counts by test type. Topic tests are reusable across
  // exams via the test_exams junction, so an exam's topic count includes
  // tests associated through that junction (matching the student catalog).
  async getExamContentCounts(): Promise<
    Record<string, { fullMock: number; pyq: number; topic: number }>
  > {
    const counts: Record<string, { fullMock: number; pyq: number; topic: number }> = {};
    const bump = (examId: string | null | undefined, kind: 'fullMock' | 'pyq' | 'topic') => {
      if (!examId) return;
      counts[examId] = counts[examId] || { fullMock: 0, pyq: 0, topic: 0 };
      counts[examId][kind] += 1;
    };
    const classify = (type: string | null | undefined): 'fullMock' | 'pyq' | 'topic' | null => {
      if (type === 'full_mock') return 'fullMock';
      if (type === 'pyq') return 'pyq';
      if (type === 'topic' || type === 'chapter_mock' || type === 'subject_mock') return 'topic';
      return null;
    };

    if (!isSupabaseConfigured) {
      const commonTopicCount = localTests.filter(
        (t) => classify((t as any).testType) === 'topic'
      ).length;

      for (const t of localTests) {
        const kind = classify((t as any).testType);
        if (kind && kind !== 'topic') bump(t.examId, kind);
      }
      for (const e of localExams) {
        counts[e.id] = counts[e.id] || { fullMock: 0, pyq: 0, topic: 0 };
        counts[e.id].topic = commonTopicCount;
      }
      return counts;
    }

    try {
      const { data: tests, error: testsError } = await supabase
        .from('tests')
        .select('id, exam_id, test_type');
      if (testsError) return counts;

      const { data: assoc, error: assocError } = await supabase
        .from('test_exams')
        .select('test_id, exam_id');

      // Total topic tests available across the platform (common for all exams)
      const commonTopicCount = (tests ?? []).filter(
        (t: any) => classify(t.test_type) === 'topic'
      ).length;

      const seen = new Set<string>();
      for (const row of tests ?? []) {
        const kind = classify(row.test_type);
        if (!kind) continue;
        if (kind !== 'topic') {
          bump(row.exam_id, kind);
        }
        if (row.exam_id) seen.add(`${row.id}:${row.exam_id}`);
      }
      // Extra exam links from the junction (skip duplicates of the owning exam_id)
      for (const row of assoc ?? []) {
        if (assocError) break;
        const kind = classify((tests ?? []).find((t) => t.id === row.test_id)?.test_type);
        if (!kind) continue;
        if (kind !== 'topic') {
          const key = `${row.test_id}:${row.exam_id}`;
          if (!seen.has(key)) {
            bump(row.exam_id, kind);
            seen.add(key);
          }
        }
      }

      // Ensure every exam receives the common topic count
      const { data: allExams } = await (supabase as any).from('exams').select('id');
      for (const ex of (allExams ?? []) as any[]) {
        counts[ex.id] = counts[ex.id] || { fullMock: 0, pyq: 0, topic: 0 };
        counts[ex.id].topic = commonTopicCount;
      }
    } catch {
      // Fail soft: UI falls back to 0s
    }
    return counts;
  },

  async getAllAdminExams(): Promise<Exam[]> {
    const [contentCounts] = await Promise.all([this.getExamContentCounts()]);
    const empty = { fullMock: 0, pyq: 0, topic: 0 };
    if (!isSupabaseConfigured) {
      return localExams.map((e) => {
        const fullMock = contentCounts[e.id]?.fullMock ?? empty.fullMock;
        const pyq = contentCounts[e.id]?.pyq ?? empty.pyq;
        const topic = contentCounts[e.id]?.topic ?? empty.topic;
        return {
          ...e,
          fullMockCount: fullMock,
          pyqCount: pyq,
          topicTestCount: topic,
          fullMocksCount: fullMock,
          pyqsCount: pyq,
          topicTestsCount: topic,
          testsCount: fullMock + pyq + topic,
        };
      });
    }
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('order_index', { ascending: true });

      if (error || !data || data.length === 0) {
        return localExams.map((e) => {
          const fullMock = contentCounts[e.id]?.fullMock ?? empty.fullMock;
          const pyq = contentCounts[e.id]?.pyq ?? empty.pyq;
          const topic = contentCounts[e.id]?.topic ?? empty.topic;
          return {
            ...e,
            fullMockCount: fullMock,
            pyqCount: pyq,
            topicTestCount: topic,
            fullMocksCount: fullMock,
            pyqsCount: pyq,
            topicTestsCount: topic,
            testsCount: fullMock + pyq + topic,
          };
        });
      }

      return (data as ExamRow[]).map((item) => {
        const fullMock = contentCounts[item.id]?.fullMock ?? empty.fullMock;
        const pyq = contentCounts[item.id]?.pyq ?? empty.pyq;
        const topic = contentCounts[item.id]?.topic ?? empty.topic;
        return {
          id: item.id,
          title: item.title,
          slug: item.slug,
          description: item.description ?? undefined,
          category: item.category,
          iconName: item.icon_name,
          bannerUrl: item.banner_url ?? undefined,
          orderIndex: item.order_index,
          isActive: item.is_active,
          fullMockCount: fullMock,
          pyqCount: pyq,
          topicTestCount: topic,
          fullMocksCount: fullMock,
          pyqsCount: pyq,
          topicTestsCount: topic,
          testsCount: fullMock + pyq + topic,
        };
      });
    } catch {
      return localExams;
    }
  },

  async createExam(examData: Omit<Exam, 'id'>): Promise<Exam> {
    const slug =
      examData.slug ||
      examData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const id = slug || `exam-${Date.now()}`;
    const newExam: Exam = {
      id,
      ...examData,
      slug,
      fullMockCount: 0,
      pyqCount: 0,
      topicTestCount: 0,
    };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('exams').insert({
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
    const existingIndex = localExams.findIndex((e) => e.id === id);
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

        await supabase.from('exams').update(updatePayload).eq('id', id);
      } catch (err) {
        console.error('Supabase updateExam error:', err);
      }
    }

    return (
      localExams[existingIndex] || {
        id,
        title: updates.title || '',
        slug: '',
        category: '',
        iconName: '',
        orderIndex: 0,
        isActive: true,
      }
    );
  },

  async deleteExam(id: string): Promise<boolean> {
    const idx = localExams.findIndex((e) => e.id === id);
    if (idx !== -1) {
      localExams.splice(idx, 1);
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await (supabase as any).from('exams').delete().eq('id', id);
        if (error) {
          console.error('Supabase deleteExam error:', error);
          throw new Error(error.message);
        }
      } catch (err) {
        console.error('Supabase deleteExam error:', err);
        throw err;
      }
    }
    return true;
  },

  async getAllAdminSubjects(examId?: string): Promise<Subject[]> {
    const localFilter = () =>
      localSubjects
        .filter((s) => !examId || !s.examId || s.examId === examId)
        .map((s) => ({
          ...s,
          chaptersCount: localChapters.filter((c) => c.subjectId === s.id).length,
        }));
    if (!isSupabaseConfigured) return localFilter();
    try {
      let query = supabase.from('subjects').select('*').order('order_index', { ascending: true });
      if (examId) query = query.or(`exam_id.eq.${examId},exam_id.is.null`);
      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        return localFilter();
      }

      return (data as SubjectRow[]).map((item) => ({
        id: item.id,
        examId: item.exam_id ?? undefined,
        name: item.name,
        slug: item.slug,
        description: item.description ?? undefined,
        iconName: item.icon_name,
        orderIndex: item.order_index,
        isActive: item.is_active,
        chaptersCount: localChapters.filter((c) => c.subjectId === item.id).length,
      }));
    } catch {
      return localFilter();
    }
  },

  async createSubject(subjectData: Omit<Subject, 'id'>): Promise<Subject> {
    const slug =
      subjectData.slug ||
      subjectData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const id = subjectData.examId
      ? `${subjectData.examId}-${slug}`.slice(0, 50)
      : `sub-${slug}`.slice(0, 50);
    const newSubject: Subject = {
      id,
      ...subjectData,
      slug,
      chaptersCount: 0,
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('subjects').insert({
          id,
          exam_id: newSubject.examId || null,
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
    const idx = localSubjects.findIndex((s) => s.id === id);
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

        const { error } = await supabase.from('subjects').update(payload).eq('id', id);
        if (error) {
          console.error('Supabase updateSubject error:', error);
          throw new Error(error.message);
        }
      } catch (err) {
        console.error('Supabase updateSubject error:', err);
        throw err;
      }
    }

    return (
      localSubjects[idx] || {
        id,
        examId: '',
        name: '',
        slug: '',
        iconName: '',
        orderIndex: 0,
        isActive: true,
      }
    );
  },

  async deleteSubject(id: string): Promise<boolean> {
    const idx = localSubjects.findIndex((s) => s.id === id);
    if (idx !== -1) {
      localSubjects.splice(idx, 1);
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('subjects').delete().eq('id', id);
        if (error) {
          console.error('Supabase deleteSubject error:', error);
          throw new Error(error.message);
        }
      } catch (err) {
        console.error('Supabase deleteSubject error:', err);
        throw err;
      }
    }
    return true;
  },

  async getAllAdminChapters(subjectId?: string): Promise<Chapter[]> {
    if (!isSupabaseConfigured) {
      return localChapters
        .filter((c) => !subjectId || c.subjectId === subjectId)
        .map((c) => ({
          ...c,
          testsCount: localTests.filter((t) => t.chapterId === c.id).length,
        }));
    }
    try {
      let query = supabase.from('chapters').select('*').order('order_index', { ascending: true });
      if (subjectId) query = query.eq('subject_id', subjectId);
      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        return localChapters.filter((c) => !subjectId || c.subjectId === subjectId);
      }

      return (data as ChapterRow[]).map((item) => ({
        id: item.id,
        subjectId: item.subject_id,
        name: item.name,
        slug: item.slug,
        description: item.description ?? undefined,
        orderIndex: item.order_index,
        isActive: item.is_active,
        testsCount: localTests.filter((t) => t.chapterId === item.id).length,
      }));
    } catch {
      return localChapters.filter((c) => !subjectId || c.subjectId === subjectId);
    }
  },

  async createChapter(chapterData: Omit<Chapter, 'id'>): Promise<Chapter> {
    const slug =
      chapterData.slug ||
      chapterData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const id = `${chapterData.subjectId}-${slug}`.slice(0, 50);
    const newChapter: Chapter = {
      id,
      ...chapterData,
      slug,
      testsCount: 0,
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('chapters').insert({
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
    const idx = localChapters.findIndex((c) => c.id === id);
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

        await supabase.from('chapters').update(payload).eq('id', id);
      } catch (err) {
        console.error('Supabase updateChapter error:', err);
      }
    }

    return (
      localChapters[idx] || { id, subjectId: '', name: '', slug: '', orderIndex: 0, isActive: true }
    );
  },

  async deleteChapter(id: string): Promise<boolean> {
    const idx = localChapters.findIndex((c) => c.id === id);
    if (idx !== -1) {
      localChapters[idx].isActive = false;
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('chapters').update({ is_active: false }).eq('id', id);
      } catch (err) {
        console.error('Supabase deleteChapter error:', err);
      }
    }
    return true;
  },

  async getTestSeries(examId?: string): Promise<TestSeries[]> {
    if (!isSupabaseConfigured) {
      return localTestSeries
        .filter((s) => !examId || s.examId === examId)
        .map((s) => {
          const exam = localExams.find((e) => e.id === s.examId);
          const count = localTests.filter((t) => t.testSeriesId === s.id).length;
          return { ...s, examTitle: exam?.title, testCount: count, testsCount: count };
        });
    }
    try {
      let query = supabase
        .from('test_series')
        .select('*, exams(title), tests(count)')
        .order('order_index', { ascending: true });
      if (examId) query = query.eq('exam_id', examId);
      const { data, error } = await query;

      if (error || !data) {
        return localTestSeries
          .filter((s) => !examId || s.examId === examId)
          .map((s) => {
            const exam = localExams.find((e) => e.id === s.examId);
            const count = localTests.filter((t) => t.testSeriesId === s.id).length;
            return { ...s, examTitle: exam?.title, testCount: count, testsCount: count };
          });
      }

      return data.map((item) => {
        const exam = localExams.find((e) => e.id === item.exam_id);
        const count =
          Array.isArray(item.tests) && item.tests[0]?.count != null
            ? Number(item.tests[0].count)
            : 0;
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
          examTitle: item.exams?.title || exam?.title,
          testCount: count,
          testsCount: count,
        };
      });
    } catch {
      return localTestSeries
        .filter((s) => !examId || s.examId === examId)
        .map((s) => {
          const exam = localExams.find((e) => e.id === s.examId);
          const count = localTests.filter((t) => t.testSeriesId === s.id).length;
          return { ...s, examTitle: exam?.title, testCount: count, testsCount: count };
        });
    }
  },

  async createTestSeries(seriesData: Omit<TestSeries, 'id'>): Promise<TestSeries> {
    const slug =
      seriesData.slug ||
      seriesData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const id = `${seriesData.examId}-${slug}`.slice(0, 50);
    const exam = localExams.find((e) => e.id === seriesData.examId);
    const newSeries: TestSeries = {
      id,
      ...seriesData,
      slug,
      examTitle: exam?.title,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('test_series').insert({
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
    const idx = localTestSeries.findIndex((s) => s.id === id);
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

        await supabase.from('test_series').update(payload).eq('id', id);
      } catch (err) {
        console.error('Supabase updateTestSeries error:', err);
      }
    }

    return (
      localTestSeries[idx] || {
        id,
        examId: '',
        title: '',
        slug: '',
        isPremium: false,
        orderIndex: 0,
        isActive: true,
      }
    );
  },

  async deleteTestSeries(id: string): Promise<boolean> {
    const idx = localTestSeries.findIndex((s) => s.id === id);
    if (idx !== -1) {
      localTestSeries[idx].isActive = false;
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('test_series').update({ is_active: false }).eq('id', id);
      } catch (err) {
        console.error('Supabase deleteTestSeries error:', err);
      }
    }
    return true;
  },

  async getAllAdminTests(filter?: {
    examId?: string;
    subjectId?: string;
    chapterId?: string;
    testSeriesId?: string;
    testType?: string;
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
        if (filter?.testType) query = query.eq('test_type', filter.testType);
        if (filter?.status) query = query.eq('status', filter.status);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          tests = (data as TestRow[]).map((row) => ({
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
      if (filter.examId) tests = tests.filter((t) => t.examId === filter.examId);
      if (filter.subjectId) tests = tests.filter((t) => t.subjectId === filter.subjectId);
      if (filter.chapterId) tests = tests.filter((t) => t.chapterId === filter.chapterId);
      if (filter.testSeriesId) tests = tests.filter((t) => t.testSeriesId === filter.testSeriesId);
      if (filter.testType) tests = tests.filter((t) => t.testType === filter.testType);
      if (filter.status) tests = tests.filter((t) => t.status === filter.status);
    }

    return tests.map((t) => {
      const exam = localExams.find((e) => e.id === t.examId);
      const subject = localSubjects.find((s) => s.id === t.subjectId);
      const chapter = localChapters.find((c) => c.id === t.chapterId);
      const series = localTestSeries.find((s) => s.id === t.testSeriesId);
      return {
        ...t,
        examTitle: exam?.title,
        subjectName: subject?.name,
        chapterName: chapter?.name,
        testSeriesTitle: series?.title,
      };
    });
  },

  async createTest(
    testData: Omit<MockTest, 'id' | 'status'> & { status?: 'draft' | 'published' | 'archived' }
  ): Promise<MockTest> {
    const slug =
      testData.slug ||
      testData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
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
        await supabase.from('tests').insert({
          id,
          exam_id: newTest.examId,
          subject_id: newTest.subjectId || null,
          chapter_id: newTest.chapterId || null,
          test_series_id: newTest.testSeriesId || null,
          title: newTest.title,
          slug: newTest.slug,
          description: newTest.description || null,
          test_type: newTest.testType,
          year: newTest.year || null,
          paper_name: newTest.paperName || null,
          shift: newTest.shift || null,
          set_name: newTest.setName || null,
          exam_date: newTest.examDate || null,
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

        const allAssocExams = Array.from(
          new Set([newTest.examId, ...(newTest.associatedExamIds || [])].filter(Boolean))
        );
        if (allAssocExams.length > 0) {
          const assocRows = allAssocExams.map((eid) => ({ test_id: id, exam_id: eid }));
          await supabase.from('test_exams').upsert(assocRows, { onConflict: 'test_id,exam_id' });
        }
      } catch (err) {
        console.error('Supabase createTest error:', err);
      }
    }

    localTests.unshift(newTest);
    return newTest;
  },

  async updateTest(id: string, updates: Partial<MockTest>): Promise<MockTest> {
    const idx = localTests.findIndex((t) => t.id === id);
    if (idx !== -1) {
      localTests[idx] = { ...localTests[idx], ...updates };
    }

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, unknown> = {};
        if (updates.examId !== undefined) payload.exam_id = updates.examId;
        if (updates.subjectId !== undefined) payload.subject_id = updates.subjectId;
        if (updates.chapterId !== undefined) {
          payload.chapter_id = updates.chapterId;
        }
        if (updates.topicId !== undefined) {
          payload.chapter_id = updates.topicId;
        }
        if (updates.testSeriesId !== undefined) payload.test_series_id = updates.testSeriesId;
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.slug !== undefined) payload.slug = updates.slug;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.testType !== undefined) payload.test_type = updates.testType;
        if (updates.year !== undefined) payload.year = updates.year;
        if (updates.paperName !== undefined) payload.paper_name = updates.paperName;
        if (updates.shift !== undefined) payload.shift = updates.shift;
        if (updates.setName !== undefined) payload.set_name = updates.setName;
        if (updates.examDate !== undefined) payload.exam_date = updates.examDate;
        if (updates.durationMinutes !== undefined)
          payload.duration_minutes = updates.durationMinutes;
        if (updates.totalQuestions !== undefined) payload.total_questions = updates.totalQuestions;
        if (updates.totalMarks !== undefined) payload.total_marks = updates.totalMarks;
        if (updates.passingMarks !== undefined) payload.passing_marks = updates.passingMarks;
        if (updates.negativeMarking !== undefined)
          payload.negative_marking = updates.negativeMarking;
        if (updates.isPremium !== undefined) payload.is_premium = updates.isPremium;
        if (updates.orderIndex !== undefined) payload.order_index = updates.orderIndex;
        if (updates.isActive !== undefined) payload.is_active = updates.isActive;
        if (updates.status !== undefined) payload.status = updates.status;

        await supabase.from('tests').update(payload).eq('id', id);

        if (updates.associatedExamIds !== undefined) {
          await catalogApi.syncTestExamAssociations(id, updates.associatedExamIds);
        }
      } catch (err) {
        console.error('Supabase updateTest error:', err);
      }
    }

    return localTests[idx] || (updates as MockTest);
  },

  async validateTestForPublish(testId: string): Promise<PublishValidationResult> {
    const errors: string[] = [];
    const test = localTests.find((t) => t.id === testId);

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
    const assignedQuestions = localTestQuestions.filter((tq) => tq.testId === testId);

    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('test_questions')
          .select('question_id, question_order, questions(*)')
          .eq('test_id', testId);
        if (data && data.length > 0) {
          data.forEach((item, idx: number) => {
            const q = item.questions as unknown as QuestionRow | null;
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
        const q = localQuestions.find((item) => item.id === tq.questionId);
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
        const { error } = await supabase.rpc('publish_test', { p_test_id: testId });
        if (error) return { success: false, error: error.message };
      } catch (err) {
        return { success: false, error: getErrorMessage(err, 'Publish RPC failed') };
      }
    }

    const idx = localTests.findIndex((t) => t.id === testId);
    if (idx !== -1) {
      localTests[idx].status = 'published';
      localTests[idx].isActive = true;
    }

    return { success: true };
  },

  async archiveTest(testId: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.rpc('archive_test', { p_test_id: testId });
        if (error) return { success: false, error: error.message };
      } catch (err) {
        return { success: false, error: getErrorMessage(err, 'Archive RPC failed') };
      }
    }

    const idx = localTests.findIndex((t) => t.id === testId);
    if (idx !== -1) {
      localTests[idx].status = 'archived';
      localTests[idx].isActive = false;
    }

    return { success: true };
  },

  async getAllAdminQuestions(filters?: {
    subjectId?: string;
    chapterId?: string;
    topicId?: string;
    difficulty?: string;
    sourceType?: string;
    search?: string;
    status?: string;
  }): Promise<Question[]> {
    let questions = [...localQuestions];

    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('questions')
          .select('*')
          .order('created_at', { ascending: false });
        if (filters?.subjectId) query = query.eq('subject_id', filters.subjectId);
        const chapId = filters?.topicId || filters?.chapterId;
        if (chapId) query = query.or(`chapter_id.eq.${chapId},topic_id.eq.${chapId}`);
        if (filters?.difficulty) query = query.eq('difficulty', filters.difficulty);
        if (filters?.sourceType) query = query.eq('source_type', filters.sourceType);
        if (filters?.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          questions = (data as QuestionRow[]).map((q) => ({
            id: q.id,
            chapterId: q.chapter_id ?? q.topic_id ?? undefined,
            topicId: q.topic_id ?? q.chapter_id ?? undefined,
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
            questionType: q.question_type || 'mcq',
            sourceType: (q.source_type as 'topic' | 'pyq' | 'other') || 'topic',
            sourceYear: q.source_year ? Number(q.source_year) : undefined,
            sourceExam: q.source_exam ?? undefined,
            sourcePaper: q.source_paper ?? undefined,
            sourceShift: q.source_shift ?? undefined,
            isActive: q.is_active,
            status: (q.status as 'active' | 'archived' | 'draft') || 'active',
          }));
        }
      } catch (err) {
        console.error('Supabase getAllAdminQuestions error:', err);
      }
    }

    if (filters) {
      if (filters.subjectId) questions = questions.filter((q) => q.subjectId === filters.subjectId);
      if (filters.chapterId)
        questions = questions.filter(
          (q) => q.chapterId === filters.chapterId || q.topicId === filters.chapterId
        );
      if (filters.topicId)
        questions = questions.filter(
          (q) => q.topicId === filters.topicId || q.chapterId === filters.topicId
        );
      if (filters.difficulty)
        questions = questions.filter((q) => q.difficulty === filters.difficulty);
      if (filters.sourceType)
        questions = questions.filter((q) => q.sourceType === filters.sourceType);
      if (filters.status) questions = questions.filter((q) => q.status === filters.status);
      if (filters.search) {
        const term = filters.search.toLowerCase();
        questions = questions.filter(
          (q) =>
            q.questionText.toLowerCase().includes(term) ||
            (q.questionBengaliText && q.questionBengaliText.toLowerCase().includes(term))
        );
      }
    }

    return questions.map((q) => {
      const subject = localSubjects.find((s) => s.id === q.subjectId);
      const chapter = localChapters.find((c) => c.id === (q.topicId || q.chapterId));
      return {
        ...q,
        subjectName: subject?.name,
        chapterName: chapter?.name,
        topicName: chapter?.name,
      };
    });
  },

  async getQuestionById(id: string): Promise<Question | null> {
    const mock = localQuestions.find((q) => q.id === id);
    if (!isSupabaseConfigured) return mock || null;

    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error || !data) return mock || null;
      const q = data as QuestionRow;
      return {
        id: q.id,
        chapterId: q.chapter_id ?? q.topic_id ?? undefined,
        topicId: q.topic_id ?? q.chapter_id ?? undefined,
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
        questionType: q.question_type || 'mcq',
        sourceType: (q.source_type as 'topic' | 'pyq' | 'other') || 'topic',
        sourceYear: q.source_year ? Number(q.source_year) : undefined,
        sourceExam: q.source_exam ?? undefined,
        sourcePaper: q.source_paper ?? undefined,
        sourceShift: q.source_shift ?? undefined,
        isActive: q.is_active,
        status: (q.status as 'active' | 'archived' | 'draft') || 'active',
      };
    } catch {
      return mock || null;
    }
  },

  async createQuestion(qData: Omit<Question, 'id'>): Promise<Question> {
    const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const effectiveTopicId = qData.topicId || qData.chapterId || null;
    const newQuestion: Question = {
      id,
      ...qData,
      topicId: effectiveTopicId || undefined,
      chapterId: effectiveTopicId || undefined,
      sourceType: qData.sourceType || 'topic',
      isActive: qData.isActive ?? true,
      status: qData.status || 'active',
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('questions').insert({
        id,
        chapter_id: effectiveTopicId,
        topic_id: effectiveTopicId,
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
        difficulty: newQuestion.difficulty || 'medium',
        default_marks: newQuestion.defaultMarks,
        default_negative_marks: newQuestion.defaultNegativeMarks,
        question_type: newQuestion.questionType || 'mcq',
        source_type: newQuestion.sourceType || 'topic',
        source_year: newQuestion.sourceYear || null,
        source_exam: newQuestion.sourceExam || null,
        source_paper: newQuestion.sourcePaper || null,
        source_shift: newQuestion.sourceShift || null,
        is_active: newQuestion.isActive,
        status: newQuestion.status,
      });
      if (error) {
        console.error('Supabase createQuestion error:', error);
        throw new Error(error.message || 'Failed to create question in database');
      }
    }

    localQuestions.unshift(newQuestion);
    return newQuestion;
  },

  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
    const idx = localQuestions.findIndex((q) => q.id === id);
    if (idx !== -1) {
      localQuestions[idx] = { ...localQuestions[idx], ...updates };
    }

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, unknown> = {};
        if (updates.questionText !== undefined) payload.question_text = updates.questionText;
        if (updates.questionBengaliText !== undefined)
          payload.question_bengali_text = updates.questionBengaliText;
        if (updates.optionA !== undefined) payload.option_a = updates.optionA;
        if (updates.optionB !== undefined) payload.option_b = updates.optionB;
        if (updates.optionC !== undefined) payload.option_c = updates.optionC;
        if (updates.optionD !== undefined) payload.option_d = updates.optionD;
        if (updates.correctOption !== undefined) payload.correct_option = updates.correctOption;
        if (updates.explanation !== undefined) payload.explanation = updates.explanation;
        if (updates.explanationBengali !== undefined)
          payload.explanation_bengali = updates.explanationBengali;
        if (updates.difficulty !== undefined) payload.difficulty = updates.difficulty;
        if (updates.defaultMarks !== undefined) payload.default_marks = updates.defaultMarks;
        if (updates.defaultNegativeMarks !== undefined)
          payload.default_negative_marks = updates.defaultNegativeMarks;
        if (updates.topicId !== undefined) {
          payload.topic_id = updates.topicId;
          payload.chapter_id = updates.topicId;
        }
        if (updates.chapterId !== undefined) {
          payload.chapter_id = updates.chapterId;
          payload.topic_id = updates.chapterId;
        }
        if (updates.subjectId !== undefined) payload.subject_id = updates.subjectId;
        if (updates.questionType !== undefined) payload.question_type = updates.questionType;
        if (updates.sourceType !== undefined) payload.source_type = updates.sourceType;
        if (updates.sourceYear !== undefined) payload.source_year = updates.sourceYear;
        if (updates.sourceExam !== undefined) payload.source_exam = updates.sourceExam;
        if (updates.sourcePaper !== undefined) payload.source_paper = updates.sourcePaper;
        if (updates.sourceShift !== undefined) payload.source_shift = updates.sourceShift;
        if (updates.isActive !== undefined) payload.is_active = updates.isActive;
        if (updates.status !== undefined) payload.status = updates.status;

        const { error } = await supabase.from('questions').update(payload).eq('id', id);
        if (error) {
          console.error('Supabase updateQuestion error:', error);
          throw new Error(error.message || 'Failed to update question in database');
        }
      } catch (err) {
        console.error('Supabase updateQuestion exception:', err);
        throw err;
      }
    }

    return localQuestions[idx] || (updates as Question);
  },

  async getExamTopicMappings(examId: string): Promise<string[]> {
    return catalogApi.getExamTopicMappings(examId);
  },

  async saveExamTopicMappings(examId: string, topicIds: string[]): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    try {
      await supabase.from('exam_topics').delete().eq('exam_id', examId);
      if (topicIds.length > 0) {
        const rows = topicIds.map((tid, idx) => ({
          exam_id: examId,
          topic_id: tid,
          order_index: idx + 1,
        }));
        const { error } = await supabase.from('exam_topics').insert(rows);
        if (error) {
          console.error('Error saving exam_topics:', error);
          return false;
        }
      }
      return true;
    } catch (err) {
      console.error('saveExamTopicMappings exception:', err);
      return false;
    }
  },

  async archiveQuestion(id: string): Promise<boolean> {
    const idx = localQuestions.findIndex((q) => q.id === id);
    if (idx !== -1) {
      localQuestions[idx].status = 'archived';
      localQuestions[idx].isActive = false;
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('questions')
        .update({ status: 'archived', is_active: false })
        .eq('id', id);
      if (error) {
        console.error('Supabase archiveQuestion error:', error);
        throw new Error(error.message || 'Failed to archive question in database');
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
      } catch (err) {
        errors.push(
          `Failed to save question "${qData.questionText.slice(0, 30)}...": ${getErrorMessage(err, 'Unknown error')}`
        );
      }
    }

    return {
      successCount,
      errorCount: parsed.invalidCount,
      errors,
    };
  },

  /**
   * Bulk import from "formatted text" blocks (study-material style):
   * question, (a)-(d) options, "সঠিক উত্তর: (b)" and "Explanation:" sections,
   * separated by blank lines. Questions land in the Topic Question Bank with
   * the given default Subject/Chapter.
   */
  async importQuestionsText(
    text: string,
    defaultSubjectId?: string,
    defaultChapterId?: string
  ): Promise<{ successCount: number; errorCount: number; errors: string[] }> {
    const parsed = parseQuestionsText(text, {
      defaultSubjectId,
      defaultChapterId,
    });

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
      } catch (err) {
        errors.push(
          `Failed to save question "${qData.questionText.slice(0, 30)}...": ${getErrorMessage(err, 'Unknown error')}`
        );
      }
    }

    return {
      successCount,
      errorCount: parsed.invalidCount,
      errors,
    };
  },

  /**
   * SEPARATE QUESTION SOURCES ARCHITECTURE:
   * Uploads a question DIRECTLY into a Full Mock or PYQ test
   * (Exam -> Full Mock Test / PYQ Paper -> Question).
   *
   * - The question is NOT required to have Subject/Topic metadata (optional).
   * - source_type is derived from the owning test ('pyq' for PYQ, 'other' for
   *   full mocks) so the question never automatically joins the Topic bank.
   * - The question is linked to the test via test_questions with the next
   *   available question_order.
   */
  async createQuestionForTest(
    testId: string,
    qData: Omit<Question, 'id'>
  ): Promise<{ success: boolean; question?: Question; error?: string }> {
    try {
      // Determine owning test & its type
      let testType: MockTest['testType'] | undefined;
      let examId: string | undefined;
      const localTest = localTests.find((t) => t.id === testId);
      if (localTest) {
        testType = localTest.testType;
        examId = localTest.examId;
      } else if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('tests')
          .select('id, test_type, exam_id')
          .eq('id', testId)
          .single();
        if (error) return { success: false, error: error.message };
        testType = (data as { test_type: MockTest['testType'] }).test_type;
        examId = (data as { exam_id: string }).exam_id;
      } else {
        return { success: false, error: 'Test not found.' };
      }

      const sourceType: Question['sourceType'] = testType === 'pyq' ? 'pyq' : 'other';

      // Create the question (createQuestion throws on DB failure now)
      const question = await this.createQuestion({
        ...qData,
        sourceType,
        sourceExam: qData.sourceExam || (testType === 'pyq' ? examId : undefined),
        subjectId: qData.subjectId || undefined,
        chapterId: qData.chapterId || qData.topicId || undefined,
        topicId: qData.topicId || qData.chapterId || undefined,
      });

      // Link to the test at the next available order
      let nextOrder = 1;
      if (isSupabaseConfigured) {
        const { data: lastRow, error: orderError } = await supabase
          .from('test_questions')
          .select('question_order')
          .eq('test_id', testId)
          .order('question_order', { ascending: false })
          .limit(1);
        if (orderError) {
          return {
            success: false,
            question,
            error: `Question created but failed to read test order: ${orderError.message}`,
          };
        }
        nextOrder = lastRow && lastRow.length > 0 ? Number(lastRow[0].question_order) + 1 : 1;

        const { error: insertError } = await supabase.from('test_questions').insert({
          test_id: testId,
          question_id: question.id,
          question_order: nextOrder,
          marks: question.defaultMarks ?? 1.0,
          negative_marks: question.defaultNegativeMarks ?? 0.25,
        });
        if (insertError) {
          return {
            success: false,
            question,
            error: `Question created but failed to assign to test: ${insertError.message}`,
          };
        }
      } else {
        nextOrder =
          localTestQuestions
            .filter((tq) => tq.testId === testId)
            .reduce((max, tq) => Math.max(max, tq.questionOrder), 0) + 1;
      }

      // Local memory fallback bookkeeping
      localTestQuestions.push({
        id: `tq-${testId}-${question.id}`,
        testId,
        questionId: question.id,
        questionOrder: nextOrder,
        marks: question.defaultMarks ?? 1.0,
        negativeMarks: question.defaultNegativeMarks ?? 0.25,
      });
      const testIdx = localTests.findIndex((t) => t.id === testId);
      if (testIdx !== -1) {
        localTests[testIdx].totalQuestions = localTestQuestions.filter(
          (tq) => tq.testId === testId
        ).length;
      }

      return { success: true, question };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to create question for test') };
    }
  },

  async getTestAssignedQuestions(testId: string): Promise<TestQuestionAssignment[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('test_questions')
          .select(
            `
            question_id,
            question_order,
            marks,
            negative_marks,
            questions (*)
          `
          )
          .eq('test_id', testId)
          .order('question_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((item) => {
            const q = item.questions as unknown as QuestionRow | null;
            return {
              questionId: item.question_id,
              questionOrder: item.question_order,
              marks: Number(item.marks),
              negativeMarks: Number(item.negative_marks),
              questionText: q?.question_text ?? undefined,
              questionBengaliText: q?.question_bengali_text ?? undefined,
              difficulty: q?.difficulty ?? undefined,
              correctOption: (q?.correct_option as 'A' | 'B' | 'C' | 'D' | null) ?? undefined,
              optionA: q?.option_a ?? undefined,
              optionB: q?.option_b ?? undefined,
              optionC: q?.option_c ?? undefined,
              optionD: q?.option_d ?? undefined,
              explanation: q?.explanation ?? undefined,
            };
          });
        }
      } catch (err) {
        console.error('Supabase getTestAssignedQuestions error:', err);
      }
    }

    // Fallback in-memory
    const assignments = localTestQuestions
      .filter((tq) => tq.testId === testId)
      .sort((a, b) => a.questionOrder - b.questionOrder);

    return assignments.map((a) => {
      const q = localQuestions.find((item) => item.id === a.questionId);
      return {
        questionId: a.questionId,
        questionOrder: a.questionOrder,
        marks: a.marks,
        negativeMarks: a.negativeMarks,
        questionText: q?.questionText,
        questionBengaliText: q?.questionBengaliText,
        difficulty: q?.difficulty ?? undefined,
        correctOption: q?.correctOption,
        optionA: q?.optionA,
        optionB: q?.optionB,
        optionC: q?.optionC,
        optionD: q?.optionD,
        explanation: q?.explanation ?? undefined,
      };
    });
  },

  async saveTestQuestions(
    testId: string,
    questions: { questionId: string; orderIndex: number; marks?: number; negativeMarks?: number }[]
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const payload = questions.map((q) => ({
          question_id: q.questionId,
          order_index: q.orderIndex,
          marks: q.marks ?? 1.0,
          negative_marks: q.negativeMarks ?? 0.25,
        }));

        const { error } = await supabase.rpc('save_test_questions', {
          p_test_id: testId,
          p_questions: payload,
        });

        if (error) return { success: false, error: error.message };
      } catch (err) {
        return { success: false, error: getErrorMessage(err, 'Failed to save test questions RPC') };
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
        questionOrder: q.orderIndex || idx + 1,
        marks,
        negativeMarks: negMarks,
      });
    });

    const testIdx = localTests.findIndex((t) => t.id === testId);
    if (testIdx !== -1) {
      localTests[testIdx].totalQuestions = questions.length;
      localTests[testIdx].totalMarks = totalMarks;
    }

    return { success: true };
  },
};
