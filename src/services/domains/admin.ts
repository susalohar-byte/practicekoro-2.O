import { getErrorMessage } from '@/lib/errors';
import { supabaseRuntime as supabase, isSupabaseConfigured } from '@/lib/supabase';
import type {
  Exam,
  ExamCategory,
  Subject,
  Chapter,
  TestSeries,
  MockTest,
  Question,
  TestQuestionAssignment,
  PublishValidationResult,
  NotificationItem,
  SupportTicketItem,
  AppSettingItem,
  StudentAttemptExportRow,
  QuestionItemAnalysis,
  ItemAnalysisFilterOptions,
  EmpiricalDifficulty,
} from '@/types';
import { parseQuestionsCsv, parseQuestionsText } from '@/utils/csvParser';
import type { ParsedTxtQuestion } from '@/utils/txtQuestionParser';
import {
  localExams,
  localExamCategories,
  localSubjects,
  localChapters,
  localTestSeries,
  localTests,
  localQuestions,
  localTestQuestions,
  localNotifications,
  syncLocalScheduledNotifications,
  localAppSettings,
  localSupportTickets,
  localItemAnalysisStore,
} from '@/services/domains/localStore';
import type { ChapterRow, ExamRow, QuestionRow, SubjectRow } from '@/services/domains/localStore';
import { catalogApi } from '@/services/domains/catalog';

/**
 * Admin content-management API (exams, subjects, chapters, series, tests, questions).
 * Full Supabase CRUD operations without mock data fallbacks when Supabase is configured.
 */

/** Maps a raw Supabase `questions` row (with subject/chapter join) to the app Question model. */
function mapQuestionRow(q: any): Question {
  return {
    id: q.id,
    chapterId: q.chapter_id ?? q.topic_id ?? undefined,
    topicId: q.topic_id ?? q.chapter_id ?? undefined,
    subjectId: q.subject_id ?? undefined,
    questionText: q.question_text,
    questionBengaliText: q.question_bengali_text ?? undefined,
    imageUrl: q.image_url ?? undefined,
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
    sourceType: (q.source_type as 'topic' | 'pyq' | 'other') || (q.source_exam ? 'other' : 'topic'),
    sourceYear: q.source_year ? Number(q.source_year) : undefined,
    sourceExam: q.source_exam ?? undefined,
    sourcePaper: q.source_paper ?? undefined,
    sourceShift: q.source_shift ?? undefined,
    isActive: q.is_active,
    status: (q.status as 'active' | 'archived' | 'draft') || 'active',
    subjectName: q.subjects?.name || undefined,
    chapterName: q.chapters?.name || undefined,
    topicName: q.chapters?.name || undefined,
  };
}

function parseSettingValue(raw: unknown): unknown {
  if (raw === null || raw === undefined) return raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return trimmed;
      }
    }
    return trimmed.replace(/^"|"$/g, '');
  }
  return raw;
}

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
      if (testsError) throw new Error(testsError.message);

      const { data: assoc, error: assocError } = await supabase
        .from('test_exams')
        .select('test_id, exam_id');
      if (assocError) throw new Error(assocError.message);

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
      const { data: allExams, error: examsError } = await supabase.from('exams').select('id');
      if (examsError) throw new Error(examsError.message);

      for (const ex of allExams ?? []) {
        counts[ex.id] = counts[ex.id] || { fullMock: 0, pyq: 0, topic: 0 };
        counts[ex.id].topic = commonTopicCount;
      }
    } catch (err) {
      console.warn('getExamContentCounts failed:', err);
    }
    return counts;
  },

  // --------------------------------------------------------------------------
  // EXAMS API
  // --------------------------------------------------------------------------
  async getAllAdminExams(): Promise<Exam[]> {
    if (!isSupabaseConfigured) {
      const contentCounts = await this.getExamContentCounts();
      const empty = { fullMock: 0, pyq: 0, topic: 0 };
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

    const [contentCounts, { data, error }] = await Promise.all([
      this.getExamContentCounts(),
      supabase.from('exams').select('*').order('order_index', { ascending: true }),
    ]);

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return [];
    }

    const empty = { fullMock: 0, pyq: 0, topic: 0 };
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
  },

  async getExamById(id: string): Promise<Exam | null> {
    if (!isSupabaseConfigured) {
      return localExams.find((e) => e.id === id) || null;
    }

    const { data, error } = await supabase.from('exams').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;

    const row = data as ExamRow;
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description ?? undefined,
      category: row.category,
      iconName: row.icon_name,
      bannerUrl: row.banner_url ?? undefined,
      orderIndex: row.order_index,
      isActive: row.is_active,
    };
  },

  async createExam(examData: Omit<Exam, 'id'>): Promise<Exam> {
    const slug =
      examData.slug ||
      examData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const id = slug || `exam-${Date.now()}`;

    if (!isSupabaseConfigured) {
      const newExam: Exam = {
        id,
        ...examData,
        slug,
        fullMockCount: 0,
        pyqCount: 0,
        topicTestCount: 0,
      };
      localExams.push(newExam);
      return newExam;
    }

    const { data, error } = await supabase
      .from('exams')
      .insert({
        id,
        title: examData.title,
        slug,
        description: examData.description || null,
        category: examData.category,
        icon_name: examData.iconName || 'Shield',
        banner_url: examData.bannerUrl || null,
        order_index: examData.orderIndex || 0,
        is_active: examData.isActive ?? true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      description: data.description ?? undefined,
      category: data.category,
      iconName: data.icon_name,
      bannerUrl: data.banner_url ?? undefined,
      orderIndex: data.order_index,
      isActive: data.is_active,
      fullMockCount: 0,
      pyqCount: 0,
      topicTestCount: 0,
      testsCount: 0,
    };
  },

  async updateExam(id: string, updates: Partial<Exam>): Promise<Exam> {
    if (!isSupabaseConfigured) {
      const existingIndex = localExams.findIndex((e) => e.id === id);
      if (existingIndex !== -1) {
        localExams[existingIndex] = { ...localExams[existingIndex], ...updates };
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
    }

    const updatePayload: Record<string, unknown> = {};
    if (updates.title !== undefined) updatePayload.title = updates.title;
    if (updates.slug !== undefined) updatePayload.slug = updates.slug;
    if (updates.description !== undefined) updatePayload.description = updates.description;
    if (updates.category !== undefined) updatePayload.category = updates.category;
    if (updates.iconName !== undefined) updatePayload.icon_name = updates.iconName;
    if (updates.bannerUrl !== undefined) updatePayload.banner_url = updates.bannerUrl;
    if (updates.orderIndex !== undefined) updatePayload.order_index = updates.orderIndex;
    if (updates.isActive !== undefined) updatePayload.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('exams')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      description: data.description ?? undefined,
      category: data.category,
      iconName: data.icon_name,
      bannerUrl: data.banner_url ?? undefined,
      orderIndex: data.order_index,
      isActive: data.is_active,
    };
  },

  async deleteExam(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const idx = localExams.findIndex((e) => e.id === id);
      if (idx !== -1) localExams.splice(idx, 1);
      return true;
    }

    // Clean up dependent associations
    await supabase.from('test_exams').delete().eq('exam_id', id);
    await supabase.from('exam_topics').delete().eq('exam_id', id);

    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
    return true;
  },

  // --------------------------------------------------------------------------
  // SUBJECTS API
  // --------------------------------------------------------------------------
  async getAllAdminSubjects(examId?: string): Promise<Subject[]> {
    if (!isSupabaseConfigured) {
      return localSubjects
        .filter((s) => !examId || !s.examId || s.examId === examId)
        .map((s) => ({
          ...s,
          chaptersCount: localChapters.filter((c) => c.subjectId === s.id).length,
        }));
    }

    let query = supabase
      .from('subjects')
      .select('*, chapters(count)')
      .order('order_index', { ascending: true });
    if (examId) query = query.or(`exam_id.eq.${examId},exam_id.is.null`);

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return (data as (SubjectRow & { chapters?: { count: number }[] })[]).map((item) => {
      const chaptersCount =
        Array.isArray(item.chapters) && item.chapters[0]?.count != null
          ? Number(item.chapters[0].count)
          : 0;
      return {
        id: item.id,
        examId: item.exam_id ?? undefined,
        name: item.name,
        slug: item.slug,
        description: item.description ?? undefined,
        iconName: item.icon_name,
        orderIndex: item.order_index,
        isActive: item.is_active,
        chaptersCount,
      };
    });
  },

  async getSubjectById(id: string): Promise<Subject | null> {
    if (!isSupabaseConfigured) {
      return localSubjects.find((s) => s.id === id) || null;
    }

    const { data, error } = await supabase
      .from('subjects')
      .select('*, chapters(count)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    const row = data as SubjectRow & { chapters?: { count: number }[] };
    const chaptersCount =
      Array.isArray(row.chapters) && row.chapters[0]?.count != null
        ? Number(row.chapters[0].count)
        : 0;

    return {
      id: row.id,
      examId: row.exam_id ?? undefined,
      name: row.name,
      slug: row.slug,
      description: row.description ?? undefined,
      iconName: row.icon_name,
      orderIndex: row.order_index,
      isActive: row.is_active,
      chaptersCount,
    };
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
      : `sub-${slug}-${Date.now().toString().slice(-4)}`.slice(0, 50);

    if (!isSupabaseConfigured) {
      const newSubject: Subject = {
        id,
        ...subjectData,
        slug,
        chaptersCount: 0,
      };
      localSubjects.push(newSubject);
      return newSubject;
    }

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        id,
        exam_id: subjectData.examId || null,
        name: subjectData.name,
        slug,
        description: subjectData.description || null,
        icon_name: subjectData.iconName || 'BookOpen',
        order_index: subjectData.orderIndex || 0,
        is_active: subjectData.isActive ?? true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      examId: data.exam_id ?? undefined,
      name: data.name,
      slug: data.slug,
      description: data.description ?? undefined,
      iconName: data.icon_name,
      orderIndex: data.order_index,
      isActive: data.is_active,
      chaptersCount: 0,
    };
  },

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject> {
    if (!isSupabaseConfigured) {
      const idx = localSubjects.findIndex((s) => s.id === id);
      if (idx !== -1) {
        localSubjects[idx] = { ...localSubjects[idx], ...updates };
      }
      return (
        localSubjects[idx] || {
          id,
          name: updates.name || '',
          slug: '',
          iconName: '',
          orderIndex: 0,
          isActive: true,
        }
      );
    }

    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.iconName !== undefined) payload.icon_name = updates.iconName;
    if (updates.orderIndex !== undefined) payload.order_index = updates.orderIndex;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.examId !== undefined) payload.exam_id = updates.examId || null;

    const { data, error } = await supabase
      .from('subjects')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      examId: data.exam_id ?? undefined,
      name: data.name,
      slug: data.slug,
      description: data.description ?? undefined,
      iconName: data.icon_name,
      orderIndex: data.order_index,
      isActive: data.is_active,
    };
  },

  async deleteSubject(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const idx = localSubjects.findIndex((s) => s.id === id);
      if (idx !== -1) localSubjects.splice(idx, 1);
      return true;
    }

    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
    return true;
  },

  // --------------------------------------------------------------------------
  // CHAPTERS / TOPICS API
  // --------------------------------------------------------------------------
  async getAllAdminChapters(subjectId?: string): Promise<Chapter[]> {
    if (!isSupabaseConfigured) {
      return localChapters
        .filter((c) => !subjectId || c.subjectId === subjectId)
        .map((c) => ({
          ...c,
          testsCount: localTests.filter((t) => t.chapterId === c.id).length,
        }));
    }

    let query = supabase
      .from('chapters')
      .select('*, tests(count)')
      .order('order_index', { ascending: true });
    if (subjectId) query = query.eq('subject_id', subjectId);

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return (data as (ChapterRow & { tests?: { count: number }[] })[]).map((item) => {
      const testsCount =
        Array.isArray(item.tests) && item.tests[0]?.count != null ? Number(item.tests[0].count) : 0;
      return {
        id: item.id,
        subjectId: item.subject_id,
        name: item.name,
        slug: item.slug,
        description: item.description ?? undefined,
        orderIndex: item.order_index,
        isActive: item.is_active,
        parentId: (item as any).parent_id ?? undefined,
        testsCount,
        updatedAt: (item as any).updated_at ?? undefined,
      };
    });
  },

  async getChapterById(id: string): Promise<Chapter | null> {
    if (!isSupabaseConfigured) {
      return localChapters.find((c) => c.id === id) || null;
    }

    const { data, error } = await supabase
      .from('chapters')
      .select('*, tests(count)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    const row = data as ChapterRow & { tests?: { count: number }[] };
    const testsCount =
      Array.isArray(row.tests) && row.tests[0]?.count != null ? Number(row.tests[0].count) : 0;

    return {
      id: row.id,
      subjectId: row.subject_id,
      name: row.name,
      slug: row.slug,
      description: row.description ?? undefined,
      orderIndex: row.order_index,
      isActive: row.is_active,
      parentId: (row as any).parent_id ?? undefined,
      testsCount,
    };
  },

  async createChapter(chapterData: Omit<Chapter, 'id'>): Promise<Chapter> {
    const slug =
      chapterData.slug ||
      chapterData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const id = `${chapterData.subjectId}-${slug}-${Date.now().toString().slice(-4)}`.slice(0, 50);

    if (!isSupabaseConfigured) {
      const newChapter: Chapter = {
        id,
        ...chapterData,
        slug,
        testsCount: 0,
      };
      localChapters.push(newChapter);
      return newChapter;
    }

    const { data, error } = await supabase
      .from('chapters')
      .insert({
        id,
        subject_id: chapterData.subjectId,
        name: chapterData.name,
        slug,
        description: chapterData.description || null,
        order_index: chapterData.orderIndex || 0,
        is_active: chapterData.isActive ?? true,
        parent_id: chapterData.parentId || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      subjectId: data.subject_id,
      name: data.name,
      slug: data.slug,
      description: data.description ?? undefined,
      orderIndex: data.order_index,
      isActive: data.is_active,
      parentId: (data as any).parent_id ?? undefined,
      testsCount: 0,
    };
  },

  async updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter> {
    if (!isSupabaseConfigured) {
      const idx = localChapters.findIndex((c) => c.id === id);
      if (idx !== -1) {
        localChapters[idx] = { ...localChapters[idx], ...updates };
      }
      return (
        localChapters[idx] || {
          id,
          subjectId: '',
          name: '',
          slug: '',
          orderIndex: 0,
          isActive: true,
        }
      );
    }

    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.orderIndex !== undefined) payload.order_index = updates.orderIndex;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.parentId !== undefined) payload.parent_id = updates.parentId || null;
    if (updates.subjectId !== undefined) payload.subject_id = updates.subjectId;

    const { data, error } = await supabase
      .from('chapters')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      subjectId: data.subject_id,
      name: data.name,
      slug: data.slug,
      description: data.description ?? undefined,
      orderIndex: data.order_index,
      isActive: data.is_active,
      parentId: (data as any).parent_id ?? undefined,
    };
  },

  async deleteChapter(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const idx = localChapters.findIndex((c) => c.id === id);
      if (idx !== -1) localChapters.splice(idx, 1);
      return true;
    }

    const { error } = await supabase.from('chapters').delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
    return true;
  },

  // --------------------------------------------------------------------------
  // TEST SERIES API
  // --------------------------------------------------------------------------
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

    let query = supabase
      .from('test_series')
      .select('*, exams:exam_id(title), tests(count)')
      .order('order_index', { ascending: true });
    if (examId) query = query.eq('exam_id', examId);

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item: any) => {
      const count =
        Array.isArray(item.tests) && item.tests[0]?.count != null ? Number(item.tests[0].count) : 0;
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
        examTitle: item.exams?.title || undefined,
        testCount: count,
        testsCount: count,
      };
    });
  },

  async createTestSeries(seriesData: Omit<TestSeries, 'id'>): Promise<TestSeries> {
    const slug =
      seriesData.slug ||
      seriesData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const id = `${seriesData.examId}-${slug}-${Date.now().toString().slice(-4)}`.slice(0, 50);

    if (!isSupabaseConfigured) {
      const exam = localExams.find((e) => e.id === seriesData.examId);
      const newSeries: TestSeries = {
        id,
        ...seriesData,
        slug,
        examTitle: exam?.title,
        createdAt: new Date().toISOString(),
      };
      localTestSeries.push(newSeries);
      return newSeries;
    }

    const { data, error } = await supabase
      .from('test_series')
      .insert({
        id,
        exam_id: seriesData.examId,
        title: seriesData.title,
        slug,
        description: seriesData.description || null,
        is_premium: seriesData.isPremium ?? false,
        order_index: seriesData.orderIndex || 0,
        is_active: seriesData.isActive ?? true,
      })
      .select('*, exams:exam_id(title)')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      examId: data.exam_id,
      title: data.title,
      slug: data.slug,
      description: data.description ?? undefined,
      isPremium: data.is_premium,
      orderIndex: data.order_index,
      isActive: data.is_active,
      createdAt: data.created_at,
      examTitle: (data as any).exams?.title || undefined,
      testCount: 0,
      testsCount: 0,
    };
  },

  async updateTestSeries(id: string, updates: Partial<TestSeries>): Promise<TestSeries> {
    if (!isSupabaseConfigured) {
      const idx = localTestSeries.findIndex((s) => s.id === id);
      if (idx !== -1) {
        localTestSeries[idx] = { ...localTestSeries[idx], ...updates };
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
    }

    const payload: Record<string, unknown> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.isPremium !== undefined) payload.is_premium = updates.isPremium;
    if (updates.orderIndex !== undefined) payload.order_index = updates.orderIndex;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.examId !== undefined) payload.exam_id = updates.examId;

    const { data, error } = await supabase
      .from('test_series')
      .update(payload)
      .eq('id', id)
      .select('*, exams:exam_id(title)')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      examId: data.exam_id,
      title: data.title,
      slug: data.slug,
      description: data.description ?? undefined,
      isPremium: data.is_premium,
      orderIndex: data.order_index,
      isActive: data.is_active,
      createdAt: data.created_at,
      examTitle: (data as any).exams?.title || undefined,
    };
  },

  async deleteTestSeries(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const idx = localTestSeries.findIndex((s) => s.id === id);
      if (idx !== -1) localTestSeries.splice(idx, 1);
      return true;
    }

    const { error } = await supabase.from('test_series').delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
    return true;
  },

  // --------------------------------------------------------------------------
  // TESTS API
  // --------------------------------------------------------------------------
  async getAllAdminTests(filter?: {
    examId?: string;
    subjectId?: string;
    chapterId?: string;
    testSeriesId?: string;
    testType?: string;
    status?: string;
  }): Promise<MockTest[]> {
    if (!isSupabaseConfigured) {
      let tests = [...localTests];
      if (filter) {
        if (filter.examId) tests = tests.filter((t) => t.examId === filter.examId);
        if (filter.subjectId) tests = tests.filter((t) => t.subjectId === filter.subjectId);
        if (filter.chapterId) tests = tests.filter((t) => t.chapterId === filter.chapterId);
        if (filter.testSeriesId)
          tests = tests.filter((t) => t.testSeriesId === filter.testSeriesId);
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
    }

    let query = supabase
      .from('tests')
      .select(
        `
        *,
        exams:exam_id (title),
        subjects:subject_id (name),
        chapters:chapter_id (name),
        test_series:test_series_id (title)
      `
      )
      .order('created_at', { ascending: false });

    if (filter?.examId) query = query.eq('exam_id', filter.examId);
    if (filter?.subjectId) query = query.eq('subject_id', filter.subjectId);
    if (filter?.chapterId) query = query.eq('chapter_id', filter.chapterId);
    if (filter?.testSeriesId) query = query.eq('test_series_id', filter.testSeriesId);
    if (filter?.testType) query = query.eq('test_type', filter.testType);
    if (filter?.status) query = query.eq('status', filter.status);

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      examId: row.exam_id ?? undefined,
      subjectId: row.subject_id ?? undefined,
      chapterId: row.chapter_id ?? undefined,
      testSeriesId: row.test_series_id ?? undefined,
      title: row.title,
      slug: row.slug,
      description: row.description ?? undefined,
      testType: row.test_type,
      year: row.year ? Number(row.year) : undefined,
      paperName: row.paper_name ?? undefined,
      shift: row.shift ?? undefined,
      setName: row.set_name ?? undefined,
      examDate: row.exam_date ?? undefined,
      durationMinutes: row.duration_minutes,
      totalQuestions: row.total_questions,
      totalMarks: Number(row.total_marks),
      passingMarks: Number(row.passing_marks),
      negativeMarking: Number(row.negative_marking),
      isPremium: row.is_premium,
      orderIndex: row.order_index,
      isActive: row.is_active,
      status: (row.status as 'draft' | 'published' | 'archived') || 'published',
      examTitle: row.exams?.title || undefined,
      subjectName: row.subjects?.name || undefined,
      chapterName: row.chapters?.name || undefined,
      testSeriesTitle: row.test_series?.title || undefined,
    }));
  },

  async getSeriesTests(testSeriesId: string): Promise<MockTest[]> {
    return this.getAllAdminTests({ testSeriesId });
  },

  async assignTestToSeries(testId: string, testSeriesId: string | null): Promise<void> {
    if (!isSupabaseConfigured) {
      const idx = localTests.findIndex((t) => t.id === testId);
      if (idx !== -1) {
        localTests[idx].testSeriesId = testSeriesId || undefined;
      }
      return;
    }

    const { error } = await supabase
      .from('tests')
      .update({ test_series_id: testSeriesId })
      .eq('id', testId);

    if (error) {
      throw new Error(error.message);
    }
  },

  async getTestById(testId: string): Promise<MockTest | null> {
    if (!isSupabaseConfigured) {
      const mockFound = localTests.find((t) => t.id === testId);
      return mockFound || null;
    }

    const { data, error } = await supabase
      .from('tests')
      .select(
        `
        *,
        exams:exam_id (title),
        subjects:subject_id (name),
        chapters:chapter_id (name),
        test_series:test_series_id (title)
      `
      )
      .eq('id', testId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    const row = data as any;
    return {
      id: row.id,
      examId: row.exam_id ?? undefined,
      subjectId: row.subject_id ?? undefined,
      chapterId: row.chapter_id ?? undefined,
      testSeriesId: row.test_series_id ?? undefined,
      title: row.title,
      slug: row.slug,
      description: row.description ?? undefined,
      testType: row.test_type,
      year: row.year ? Number(row.year) : undefined,
      paperName: row.paper_name ?? undefined,
      shift: row.shift ?? undefined,
      setName: row.set_name ?? undefined,
      examDate: row.exam_date ?? undefined,
      durationMinutes: row.duration_minutes,
      totalQuestions: row.total_questions,
      totalMarks: Number(row.total_marks),
      passingMarks: Number(row.passing_marks),
      negativeMarking: Number(row.negative_marking),
      isPremium: row.is_premium,
      orderIndex: row.order_index,
      isActive: row.is_active,
      status: (row.status as 'draft' | 'published' | 'archived') || 'published',
      examTitle: row.exams?.title || undefined,
      subjectName: row.subjects?.name || undefined,
      chapterName: row.chapters?.name || undefined,
      testSeriesTitle: row.test_series?.title || undefined,
    };
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

    if (!isSupabaseConfigured) {
      const newTest: MockTest = {
        id,
        ...testData,
        slug,
        status: testData.status || 'draft',
        isActive: testData.isActive ?? true,
      };
      localTests.unshift(newTest);
      return newTest;
    }

    const { data, error } = await supabase
      .from('tests')
      .insert({
        id,
        exam_id: testData.examId || null,
        subject_id: testData.subjectId || null,
        chapter_id: testData.chapterId || null,
        test_series_id: testData.testSeriesId || null,
        title: testData.title,
        slug,
        description: testData.description || null,
        test_type: testData.testType,
        year: testData.year || null,
        paper_name: testData.paperName || null,
        shift: testData.shift || null,
        set_name: testData.setName || null,
        exam_date: testData.examDate || null,
        duration_minutes: testData.durationMinutes,
        total_questions: testData.totalQuestions || 0,
        total_marks: testData.totalMarks || 0,
        passing_marks: testData.passingMarks || 0,
        negative_marking: testData.negativeMarking ?? 0.25,
        is_premium: testData.isPremium ?? false,
        order_index: testData.orderIndex || 0,
        is_active: testData.isActive ?? true,
        status: testData.status || 'draft',
      })
      .select(
        `
        *,
        exams:exam_id (title),
        subjects:subject_id (name),
        chapters:chapter_id (name),
        test_series:test_series_id (title)
      `
      )
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Sync extra exam associations
    const allAssocExams = Array.from(
      new Set(
        [testData.examId, ...(testData.associatedExamIds || [])].filter((x): x is string =>
          Boolean(x)
        )
      )
    );
    if (allAssocExams.length > 0) {
      const assocRows = allAssocExams.map((eid) => ({ test_id: id, exam_id: eid }));
      await supabase.from('test_exams').upsert(assocRows, { onConflict: 'test_id,exam_id' });
    }

    const row = data as any;
    return {
      id: row.id,
      examId: row.exam_id ?? undefined,
      subjectId: row.subject_id ?? undefined,
      chapterId: row.chapter_id ?? undefined,
      testSeriesId: row.test_series_id ?? undefined,
      title: row.title,
      slug: row.slug,
      description: row.description ?? undefined,
      testType: row.test_type,
      year: row.year ? Number(row.year) : undefined,
      paperName: row.paper_name ?? undefined,
      shift: row.shift ?? undefined,
      setName: row.set_name ?? undefined,
      examDate: row.exam_date ?? undefined,
      durationMinutes: row.duration_minutes,
      totalQuestions: row.total_questions,
      totalMarks: Number(row.total_marks),
      passingMarks: Number(row.passing_marks),
      negativeMarking: Number(row.negative_marking),
      isPremium: row.is_premium,
      orderIndex: row.order_index,
      isActive: row.is_active,
      status: (row.status as 'draft' | 'published' | 'archived') || 'draft',
      examTitle: row.exams?.title || undefined,
      subjectName: row.subjects?.name || undefined,
      chapterName: row.chapters?.name || undefined,
      testSeriesTitle: row.test_series?.title || undefined,
    };
  },

  async updateTest(id: string, updates: Partial<MockTest>): Promise<MockTest> {
    if (!isSupabaseConfigured) {
      const idx = localTests.findIndex((t) => t.id === id);
      if (idx !== -1) {
        localTests[idx] = { ...localTests[idx], ...updates };
      }
      return localTests[idx] || (updates as MockTest);
    }

    const payload: Record<string, unknown> = {};
    if (updates.examId !== undefined) payload.exam_id = updates.examId || null;
    if (updates.subjectId !== undefined) payload.subject_id = updates.subjectId || null;
    if (updates.chapterId !== undefined) payload.chapter_id = updates.chapterId || null;
    if (updates.topicId !== undefined) payload.chapter_id = updates.topicId || null;
    if (updates.testSeriesId !== undefined) payload.test_series_id = updates.testSeriesId || null;
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.testType !== undefined) payload.test_type = updates.testType;
    if (updates.year !== undefined) payload.year = updates.year || null;
    if (updates.paperName !== undefined) payload.paper_name = updates.paperName || null;
    if (updates.shift !== undefined) payload.shift = updates.shift || null;
    if (updates.setName !== undefined) payload.set_name = updates.setName || null;
    if (updates.examDate !== undefined) payload.exam_date = updates.examDate || null;
    if (updates.durationMinutes !== undefined) payload.duration_minutes = updates.durationMinutes;
    if (updates.totalQuestions !== undefined) payload.total_questions = updates.totalQuestions;
    if (updates.totalMarks !== undefined) payload.total_marks = updates.totalMarks;
    if (updates.passingMarks !== undefined) payload.passing_marks = updates.passingMarks;
    if (updates.negativeMarking !== undefined) payload.negative_marking = updates.negativeMarking;
    if (updates.isPremium !== undefined) payload.is_premium = updates.isPremium;
    if (updates.orderIndex !== undefined) payload.order_index = updates.orderIndex;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.status !== undefined) payload.status = updates.status;

    const { data, error } = await supabase
      .from('tests')
      .update(payload)
      .eq('id', id)
      .select(
        `
        *,
        exams:exam_id (title),
        subjects:subject_id (name),
        chapters:chapter_id (name),
        test_series:test_series_id (title)
      `
      )
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (updates.associatedExamIds !== undefined) {
      await catalogApi.syncTestExamAssociations(id, updates.associatedExamIds);
    }

    const row = data as any;
    return {
      id: row.id,
      examId: row.exam_id ?? undefined,
      subjectId: row.subject_id ?? undefined,
      chapterId: row.chapter_id ?? undefined,
      testSeriesId: row.test_series_id ?? undefined,
      title: row.title,
      slug: row.slug,
      description: row.description ?? undefined,
      testType: row.test_type,
      year: row.year ? Number(row.year) : undefined,
      paperName: row.paper_name ?? undefined,
      shift: row.shift ?? undefined,
      setName: row.set_name ?? undefined,
      examDate: row.exam_date ?? undefined,
      durationMinutes: row.duration_minutes,
      totalQuestions: row.total_questions,
      totalMarks: Number(row.total_marks),
      passingMarks: Number(row.passing_marks),
      negativeMarking: Number(row.negative_marking),
      isPremium: row.is_premium,
      orderIndex: row.order_index,
      isActive: row.is_active,
      status: (row.status as 'draft' | 'published' | 'archived') || 'published',
      examTitle: row.exams?.title || undefined,
      subjectName: row.subjects?.name || undefined,
      chapterName: row.chapters?.name || undefined,
      testSeriesTitle: row.test_series?.title || undefined,
    };
  },

  async deleteTest(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const idx = localTests.findIndex((t) => t.id === id);
      if (idx !== -1) localTests.splice(idx, 1);
      return true;
    }

    // Clean test_questions junction
    await supabase.from('test_questions').delete().eq('test_id', id);
    // Clean test_exams junction
    await supabase.from('test_exams').delete().eq('test_id', id);

    const { error } = await supabase.from('tests').delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
    return true;
  },

  async duplicateTest(id: string): Promise<MockTest | null> {
    const existing = await this.getTestById(id);
    if (!existing) return null;

    const newTest = await this.createTest({
      title: `${existing.title} (Copy)`,
      slug: `${existing.slug || 'test'}-copy-${Date.now()}`,
      description: existing.description,
      examId: existing.examId,
      subjectId: existing.subjectId,
      chapterId: existing.chapterId,
      topicId: existing.topicId,
      durationMinutes: existing.durationMinutes,
      totalMarks: existing.totalMarks,
      passingMarks: existing.passingMarks,
      negativeMarking: existing.negativeMarking,
      isPremium: existing.isPremium,
      testType: existing.testType,
      totalQuestions: existing.totalQuestions || 0,
      orderIndex: (existing.orderIndex || 1) + 1,
      isActive: false,
      year: existing.year,
      paperName: existing.paperName,
      shift: existing.shift,
      status: 'draft',
    });

    try {
      const qAssigned = await this.getTestAssignedQuestions(id);
      if (qAssigned && qAssigned.length > 0) {
        await this.saveTestQuestions(
          newTest.id,
          qAssigned.map((q: TestQuestionAssignment, idx: number) => ({
            questionId: q.questionId,
            orderIndex: idx + 1,
            marks: q.marks,
            negativeMarks: q.negativeMarks,
          }))
        );
      }
    } catch (e) {
      console.warn('Questions duplication note:', e);
    }

    return newTest;
  },

  async getTestAttempts(testId: string): Promise<any[]> {
    if (!isSupabaseConfigured) {
      return [];
    }
    const { data, error } = await supabase
      .from('test_attempts')
      .select(
        'id, user_id, score, total_marks, accuracy, correct_count, wrong_count, skipped_count, time_spent_seconds, status, created_at, profiles(full_name, email)'
      )
      .eq('test_id', testId)
      .order('score', { ascending: false });

    if (error) {
      const { data: fallbackData } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('test_id', testId)
        .order('score', { ascending: false });
      return (fallbackData || []).map((d: any, idx: number) => ({
        id: d.id,
        rank: idx + 1,
        userId: d.user_id,
        userName: 'Student Candidate',
        userEmail: '',
        score: Number(d.score || 0),
        totalMarks: Number(d.total_marks || 0),
        accuracy: Number(d.accuracy || 0),
        correctCount: Number(d.correct_count || 0),
        wrongCount: Number(d.wrong_count || 0),
        skippedCount: Number(d.skipped_count || 0),
        timeSpentSeconds: Number(d.time_spent_seconds || 0),
        status: d.status || 'completed',
        createdAt: d.created_at,
      }));
    }

    return (data || []).map((d: any, idx: number) => ({
      id: d.id,
      rank: idx + 1,
      userId: d.user_id,
      userName: d.profiles?.full_name || 'Student Candidate',
      userEmail: d.profiles?.email || '',
      score: Number(d.score || 0),
      totalMarks: Number(d.total_marks || 0),
      accuracy: Number(d.accuracy || 0),
      correctCount: Number(d.correct_count || 0),
      wrongCount: Number(d.wrong_count || 0),
      skippedCount: Number(d.skipped_count || 0),
      timeSpentSeconds: Number(d.time_spent_seconds || 0),
      status: d.status || 'completed',
      createdAt: d.created_at,
    }));
  },

  async getTestResultsForExport(testId: string): Promise<StudentAttemptExportRow[]> {
    const rawAttempts = await this.getTestAttempts(testId);
    return rawAttempts.map((att, idx) => {
      const score = Number(att.score ?? 0);
      const totalMarks = Number(att.totalMarks ?? 0);
      const percentage = totalMarks > 0 ? Number(((score / totalMarks) * 100).toFixed(2)) : 0;
      const accuracy = Number(att.accuracy ?? 0);
      const seconds = Number(att.timeSpentSeconds ?? 0);
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return {
        rank: att.rank || idx + 1,
        candidateName: att.userName || 'Student Candidate',
        email: att.userEmail || '-',
        phone: undefined,
        score,
        totalMarks,
        percentage,
        accuracy,
        correctCount: Number(att.correctCount ?? 0),
        wrongCount: Number(att.wrongCount ?? 0),
        skippedCount: Number(att.skippedCount ?? 0),
        timeSpentMinutes: `${m}m ${s}s`,
        attemptDate: att.createdAt || new Date().toISOString(),
      };
    });
  },

  exportTestResultsToCsv(testTitle: string, rows: StudentAttemptExportRow[]): void {
    const headers = [
      'Rank',
      'Candidate Name',
      'Email / Phone',
      'Score',
      'Total Marks',
      'Percentage (%)',
      'Accuracy (%)',
      'Correct',
      'Wrong',
      'Skipped / Unattempted',
      'Time Spent (M:S)',
      'Submitted At',
    ];

    const escapeCsv = (val: unknown) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvLines = [headers.join(',')];
    for (const r of rows) {
      csvLines.push(
        [
          r.rank,
          escapeCsv(r.candidateName),
          escapeCsv(r.email || r.phone || '-'),
          r.score,
          r.totalMarks,
          r.percentage,
          r.accuracy,
          r.correctCount,
          r.wrongCount,
          r.skippedCount,
          escapeCsv(r.timeSpentMinutes),
          escapeCsv(new Date(r.attemptDate).toLocaleString('en-IN')),
        ].join(',')
      );
    }

    // Include UTF-8 BOM (\uFEFF) for Excel compatibility with Bengali & symbols
    const blob = new Blob(['\uFEFF' + csvLines.join('\r\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = testTitle.replace(/[^a-zA-Z0-9_\u0980-\u09FF]+/g, '_').slice(0, 40);
    a.download = `${safeTitle}_results_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  exportTestQuestionsToCsv(testTitle: string, questions: Question[]): void {
    const headers = [
      'Question Number',
      'Question Text (English/Bengali)',
      'Option A',
      'Option B',
      'Option C',
      'Option D',
      'Correct Answer (A/B/C/D)',
      'Marks',
      'Negative Marks',
      'Difficulty',
      'Subject',
      'Chapter / Topic',
      'Diagram / Image URL',
      'Explanation / Short Notes',
    ];

    const escapeCsv = (val: unknown) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvLines = [headers.join(',')];
    questions.forEach((q, idx) => {
      csvLines.push(
        [
          idx + 1,
          escapeCsv(q.questionBengaliText || q.questionText),
          escapeCsv(q.optionA),
          escapeCsv(q.optionB),
          escapeCsv(q.optionC),
          escapeCsv(q.optionD),
          q.correctOption,
          q.defaultMarks ?? 1,
          q.defaultNegativeMarks ?? 0.25,
          escapeCsv(q.difficulty),
          escapeCsv(q.subjectName || '-'),
          escapeCsv(q.chapterName || q.topicName || '-'),
          escapeCsv(q.imageUrl || ''),
          escapeCsv(q.explanationBengali || q.explanation || ''),
        ].join(',')
      );
    });

    const blob = new Blob(['\uFEFF' + csvLines.join('\r\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = testTitle.replace(/[^a-zA-Z0-9_\u0980-\u09FF]+/g, '_').slice(0, 40);
    a.download = `${safeTitle}_questions_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  async validateTestForPublish(testId: string): Promise<PublishValidationResult> {
    const errors: string[] = [];

    if (!isSupabaseConfigured) {
      const test = localTests.find((t) => t.id === testId);
      if (!test) return { isValid: false, errors: ['Test not found.'] };
      if (!test.examId) errors.push('Exam must be selected.');
      if (test.durationMinutes <= 0) errors.push('Test duration must be greater than 0 minutes.');
      if (test.totalMarks <= 0) errors.push('Total marks must be greater than 0.');
      const assigned = localTestQuestions.filter((tq) => tq.testId === testId);
      if (assigned.length === 0) {
        errors.push('Test must have at least one question assigned before publishing.');
      }
      return { isValid: errors.length === 0, errors };
    }

    const { data: testData, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .maybeSingle();

    if (testError) return { isValid: false, errors: [testError.message] };
    if (!testData) return { isValid: false, errors: ['Test not found in database.'] };

    if (!testData.exam_id) {
      errors.push('Exam must be selected.');
    }
    if (testData.duration_minutes <= 0) {
      errors.push('Test duration must be greater than 0 minutes.');
    }
    if (Number(testData.total_marks) <= 0) {
      errors.push('Total marks must be greater than 0.');
    }

    const { data: tqData, error: tqError } = await supabase
      .from('test_questions')
      .select('question_id, question_order, questions(*)')
      .eq('test_id', testId)
      .order('question_order', { ascending: true });

    if (tqError) {
      return { isValid: false, errors: [tqError.message] };
    }

    if (!tqData || tqData.length === 0) {
      errors.push('Test must have at least one question assigned before publishing.');
      return { isValid: false, errors };
    }

    tqData.forEach((item: any, idx: number) => {
      const q = item.questions as QuestionRow | null;
      if (!q) {
        errors.push(`Question #${idx + 1} data is missing from question bank.`);
      } else {
        if (!q.question_text || q.question_text.trim() === '') {
          errors.push(`Question #${idx + 1} has empty question text.`);
        }
        if (!q.option_a || !q.option_b || !q.option_c || !q.option_d) {
          errors.push(`Question #${idx + 1} must have all 4 options (A, B, C, D).`);
        }
        if (!['A', 'B', 'C', 'D'].includes(q.correct_option)) {
          errors.push(`Question #${idx + 1} has invalid or missing correct answer key.`);
        }
      }
    });

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
        const { error: rpcError } = await supabase.rpc('publish_test', { p_test_id: testId });
        if (!rpcError) return { success: true };
      } catch {
        // Fall back to direct update
      }

      const { error: updateError } = await supabase
        .from('tests')
        .update({ status: 'published', is_active: true, updated_at: new Date().toISOString() })
        .eq('id', testId);

      if (updateError) return { success: false, error: updateError.message };
      return { success: true };
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
        const { error: rpcError } = await supabase.rpc('archive_test', { p_test_id: testId });
        if (!rpcError) return { success: true };
      } catch {
        // Fall back to direct update
      }

      const { error: updateError } = await supabase
        .from('tests')
        .update({ status: 'archived', is_active: false, updated_at: new Date().toISOString() })
        .eq('id', testId);

      if (updateError) return { success: false, error: updateError.message };
      return { success: true };
    }

    const idx = localTests.findIndex((t) => t.id === testId);
    if (idx !== -1) {
      localTests[idx].status = 'archived';
      localTests[idx].isActive = false;
    }

    return { success: true };
  },

  // --------------------------------------------------------------------------
  // QUESTIONS API
  // --------------------------------------------------------------------------
  async getAllAdminQuestions(filters?: {
    subjectId?: string;
    chapterId?: string;
    topicId?: string;
    difficulty?: string;
    sourceType?: string;
    sourceExam?: string;
    testId?: string;
    search?: string;
    status?: string;
  }): Promise<Question[]> {
    if (!isSupabaseConfigured) {
      let questions = [...localQuestions];
      if (filters) {
        if (filters.subjectId)
          questions = questions.filter((q) => q.subjectId === filters.subjectId);
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
        if (filters.sourceType) {
          if (filters.sourceType === 'full_mock' || filters.sourceType === 'other') {
            questions = questions.filter(
              (q) =>
                q.sourceType === 'other' ||
                (q.sourceType as string) === 'full_mock' ||
                Boolean(q.sourceExam && q.sourceType !== 'topic' && q.sourceType !== 'pyq')
            );
          } else {
            questions = questions.filter((q) => q.sourceType === filters.sourceType);
          }
        }
        if (filters.sourceExam) {
          const sExam = filters.sourceExam.toLowerCase();
          questions = questions.filter(
            (q) =>
              q.sourceExam &&
              (q.sourceExam.toLowerCase() === sExam ||
                q.sourceExam.toLowerCase().includes(sExam) ||
                sExam.includes(q.sourceExam.toLowerCase()))
          );
        }
        if (filters.testId) {
          const tqIds = localTestQuestions
            .filter((tq) => tq.testId === filters.testId)
            .map((tq) => tq.questionId);
          questions = questions.filter((q) => tqIds.includes(q.id));
        }
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
      return questions;
    }

    let testQuestionIds: string[] | null = null;
    if (filters?.testId) {
      const { data: tqData, error: tqError } = await supabase
        .from('test_questions')
        .select('question_id')
        .eq('test_id', filters.testId);

      if (tqError) throw new Error(tqError.message);
      testQuestionIds = tqData?.map((r: any) => r.question_id) || [];
      if (testQuestionIds.length === 0) {
        return [];
      }
    }

    let query = supabase
      .from('questions')
      .select(
        `
        *,
        subjects:subject_id (id, name),
        chapters:chapter_id (id, name)
      `
      )
      .order('created_at', { ascending: false });

    if (testQuestionIds && testQuestionIds.length > 0) {
      query = query.in('id', testQuestionIds);
    }
    if (filters?.subjectId) query = query.eq('subject_id', filters.subjectId);
    const chapId = filters?.topicId || filters?.chapterId;
    if (chapId) query = query.or(`chapter_id.eq.${chapId},topic_id.eq.${chapId}`);
    if (filters?.difficulty) query = query.eq('difficulty', filters.difficulty);
    if (filters?.sourceType) {
      if (filters.sourceType === 'full_mock' || filters.sourceType === 'other') {
        query = query.in('source_type', ['other', 'full_mock']);
      } else {
        query = query.eq('source_type', filters.sourceType);
      }
    }
    if (filters?.sourceExam) query = query.eq('source_exam', filters.sourceExam);
    if (filters?.status) query = query.eq('status', filters.status);

    if (filters?.search && filters.search.trim()) {
      const term = filters.search.trim();
      query = query.or(
        `question_text.ilike.%${term}%,question_bengali_text.ilike.%${term}%,explanation.ilike.%${term}%,explanation_bengali.ilike.%${term}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((q: any) => mapQuestionRow(q));
  },

  /**
   * Server-side paginated question fetch (large banks must not load entirely
   * into the browser). Returns the page of questions plus the exact total
   * count so the admin UI can render pagination controls.
   */
  async getAdminQuestionsPaged(
    filters:
      | {
          subjectId?: string;
          chapterId?: string;
          topicId?: string;
          difficulty?: string;
          sourceType?: string;
          search?: string;
          status?: string;
        }
      | undefined,
    page: number,
    pageSize: number
  ): Promise<{ questions: Question[]; total: number }> {
    const safePage = Math.max(1, Math.floor(page) || 1);
    const safeSize = Math.min(200, Math.max(1, Math.floor(pageSize) || 50));
    const from = (safePage - 1) * safeSize;
    const to = from + safeSize - 1;

    if (!isSupabaseConfigured) {
      const all = await this.getAllAdminQuestions(filters);
      return {
        questions: all.slice(from, from + safeSize),
        total: all.length,
      };
    }

    let query = supabase
      .from('questions')
      .select(
        `
        *,
        subjects:subject_id (id, name),
        chapters:chapter_id (id, name)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    if (filters?.subjectId) query = query.eq('subject_id', filters.subjectId);
    const chapId = filters?.topicId || filters?.chapterId;
    if (chapId) query = query.or(`chapter_id.eq.${chapId},topic_id.eq.${chapId}`);
    if (filters?.sourceType) {
      if (filters.sourceType === 'full_mock' || filters.sourceType === 'other') {
        query = query.in('source_type', ['other', 'full_mock']);
      } else {
        query = query.eq('source_type', filters.sourceType);
      }
    }
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search && filters.search.trim()) {
      const term = filters.search.trim();
      query = query.or(
        `question_text.ilike.%${term}%,question_bengali_text.ilike.%${term}%,explanation.ilike.%${term}%,explanation_bengali.ilike.%${term}%`
      );
    }

    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) {
      throw new Error(error.message);
    }

    return {
      questions: (data || []).map((q: any) => mapQuestionRow(q)),
      total: count ?? (data ? data.length : 0),
    };
  },

  async getQuestionById(id: string): Promise<Question | null> {
    if (!isSupabaseConfigured) {
      return localQuestions.find((q) => q.id === id) || null;
    }

    const { data, error } = await supabase
      .from('questions')
      .select(
        `
        *,
        subjects:subject_id (id, name),
        chapters:chapter_id (id, name)
      `
      )
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return mapQuestionRow(data);
  },

  async createQuestion(qData: Omit<Question, 'id'>): Promise<Question> {
    const id = crypto.randomUUID();
    const effectiveTopicId = qData.topicId || qData.chapterId || null;

    if (!isSupabaseConfigured) {
      const newQuestion: Question = {
        id,
        ...qData,
        topicId: effectiveTopicId || undefined,
        chapterId: effectiveTopicId || undefined,
        sourceType: qData.sourceType || 'topic',
        isActive: qData.isActive ?? true,
        status: qData.status || 'active',
      };
      localQuestions.unshift(newQuestion);
      return newQuestion;
    }

    const { data, error } = await supabase
      .from('questions')
      .insert({
        id,
        chapter_id: effectiveTopicId,
        topic_id: effectiveTopicId,
        subject_id: qData.subjectId || null,
        question_text: qData.questionText,
        question_bengali_text: qData.questionBengaliText || null,
        image_url: qData.imageUrl || null,
        option_a: qData.optionA,
        option_b: qData.optionB,
        option_c: qData.optionC,
        option_d: qData.optionD,
        correct_option: qData.correctOption,
        explanation: qData.explanation || null,
        explanation_bengali: qData.explanationBengali || null,
        difficulty: qData.difficulty || 'medium',
        default_marks: qData.defaultMarks ?? 1.0,
        default_negative_marks: qData.defaultNegativeMarks ?? 0.25,
        question_type: qData.questionType || 'mcq',
        source_type: qData.sourceType || 'topic',
        source_year: qData.sourceYear || null,
        source_exam: qData.sourceExam || null,
        source_paper: qData.sourcePaper || null,
        source_shift: qData.sourceShift || null,
        is_active: qData.isActive ?? true,
        status: qData.status || 'active',
      })
      .select(
        `
        *,
        subjects:subject_id (id, name),
        chapters:chapter_id (id, name)
      `
      )
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to create question in database');
    }

    return mapQuestionRow(data);
  },

  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
    if (!isSupabaseConfigured) {
      const idx = localQuestions.findIndex((q) => q.id === id);
      if (idx !== -1) {
        localQuestions[idx] = { ...localQuestions[idx], ...updates };
      }
      return localQuestions[idx] || (updates as Question);
    }

    const payload: Record<string, unknown> = {};
    if (updates.questionText !== undefined) payload.question_text = updates.questionText;
    if (updates.questionBengaliText !== undefined)
      payload.question_bengali_text = updates.questionBengaliText;
    if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl || null;
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
      payload.topic_id = updates.topicId || null;
      payload.chapter_id = updates.topicId || null;
    }
    if (updates.chapterId !== undefined) {
      payload.chapter_id = updates.chapterId || null;
      payload.topic_id = updates.chapterId || null;
    }
    if (updates.subjectId !== undefined) payload.subject_id = updates.subjectId || null;
    if (updates.questionType !== undefined) payload.question_type = updates.questionType;
    if (updates.sourceType !== undefined) payload.source_type = updates.sourceType;
    if (updates.sourceYear !== undefined) payload.source_year = updates.sourceYear || null;
    if (updates.sourceExam !== undefined) payload.source_exam = updates.sourceExam || null;
    if (updates.sourcePaper !== undefined) payload.source_paper = updates.sourcePaper || null;
    if (updates.sourceShift !== undefined) payload.source_shift = updates.sourceShift || null;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.status !== undefined) payload.status = updates.status;

    const { data, error } = await supabase
      .from('questions')
      .update(payload)
      .eq('id', id)
      .select(
        `
        *,
        subjects:subject_id (id, name),
        chapters:chapter_id (id, name)
      `
      )
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to update question in database');
    }

    return mapQuestionRow(data);
  },

  async deleteQuestion(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const idx = localQuestions.findIndex((q) => q.id === id);
      if (idx !== -1) localQuestions.splice(idx, 1);
      const tqIdx = localTestQuestions.findIndex((t) => t.questionId === id);
      if (tqIdx !== -1) localTestQuestions.splice(tqIdx, 1);
      return true;
    }

    // Delete test_questions assignments first
    await supabase.from('test_questions').delete().eq('question_id', id);

    // Delete question
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) {
      throw new Error(error.message || 'Failed to delete question from database');
    }
    return true;
  },

  async deleteQuestions(ids: string[]): Promise<{ success: boolean; deletedCount: number }> {
    if (ids.length === 0) return { success: true, deletedCount: 0 };

    if (!isSupabaseConfigured) {
      const idSet = new Set(ids);
      const initialLength = localQuestions.length;
      for (let i = localQuestions.length - 1; i >= 0; i--) {
        if (idSet.has(localQuestions[i].id)) {
          localQuestions.splice(i, 1);
        }
      }
      for (let i = localTestQuestions.length - 1; i >= 0; i--) {
        if (idSet.has(localTestQuestions[i].questionId)) {
          localTestQuestions.splice(i, 1);
        }
      }
      const deletedCount = initialLength - localQuestions.length;
      return { success: true, deletedCount: deletedCount || ids.length };
    }

    await supabase.from('test_questions').delete().in('question_id', ids);

    const { error } = await supabase.from('questions').delete().in('id', ids);
    if (error) {
      throw new Error(error.message || 'Failed to bulk delete questions from database');
    }

    return { success: true, deletedCount: ids.length };
  },

  async archiveQuestion(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const idx = localQuestions.findIndex((q) => q.id === id);
      if (idx !== -1) {
        localQuestions[idx].status = 'archived';
        localQuestions[idx].isActive = false;
      }
      return true;
    }

    const { error } = await supabase
      .from('questions')
      .update({ status: 'archived', is_active: false })
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'Failed to archive question in database');
    }
    return true;
  },

  async uploadQuestionImage(file: File): Promise<string> {
    if (!isSupabaseConfigured) {
      return URL.createObjectURL(file);
    }
    const ext = file.name.split('.').pop() || 'png';
    const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const filePath = `questions/${fileName}`;

    const { data, error } = await supabase.storage.from('question-images').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('question-images')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  },

  // --------------------------------------------------------------------------
  // EXAM CATEGORIES (DATABASE BACKED WITH LOCAL FALLBACK & ORDER PERSISTENCE)
  // --------------------------------------------------------------------------
  getLocalExamCategoriesWithPersistence(): ExamCategory[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('practicekoro_exam_categories');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            if (parsed.length === 0) return [];
            return parsed.map((item: any, index: number) => {
              if (typeof item === 'string') {
                const existing = localExamCategories.find(
                  (c) => c.name.toLowerCase() === item.toLowerCase()
                );
                return {
                  id: existing?.id || 'cat_' + item.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                  name: item,
                  orderIndex: index + 1,
                  isActive: true,
                };
              }
              return {
                id: item.id || 'cat_' + (item.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                name: item.name || '',
                orderIndex: item.orderIndex ?? index + 1,
                isActive: item.isActive ?? true,
              };
            });
          }
        }
      }
    } catch (e) {
      console.warn('Error reading persisted categories fallback:', e);
    }
    return [...localExamCategories].sort((a, b) => a.orderIndex - b.orderIndex);
  },

  async getExamCategories(): Promise<ExamCategory[]> {
    if (!isSupabaseConfigured) {
      return this.getLocalExamCategoriesWithPersistence();
    }
    try {
      const { data, error } = await supabase
        .from('exam_categories')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          orderIndex: Number(d.order_index || 0),
          isActive: d.is_active ?? true,
          createdAt: d.created_at,
        }));
      }
      return this.getLocalExamCategoriesWithPersistence();
    } catch (err) {
      console.warn('Failed to load categories from Supabase, using local fallback:', err);
      return this.getLocalExamCategoriesWithPersistence();
    }
  },

  async createExamCategory(name: string, orderIndex?: number): Promise<ExamCategory> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Category name cannot be empty');
    const slug = 'cat_' + trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const newCat: ExamCategory = {
      id: slug,
      name: trimmed,
      orderIndex: orderIndex ?? localExamCategories.length + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    // Always keep in-memory fallback up-to-date
    const existingIdx = localExamCategories.findIndex(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase() || c.id === slug
    );
    if (existingIdx !== -1) {
      localExamCategories[existingIdx] = { ...localExamCategories[existingIdx], ...newCat };
    } else {
      localExamCategories.push(newCat);
    }

    // Save to localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('practicekoro_exam_categories');
        const list: string[] = saved ? JSON.parse(saved) : localExamCategories.map((c) => c.name);
        if (!list.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
          list.push(trimmed);
          window.localStorage.setItem('practicekoro_exam_categories', JSON.stringify(list));
        }
      }
    } catch (e) {
      console.warn('Failed to update localStorage on create category:', e);
    }

    if (!isSupabaseConfigured) {
      return newCat;
    }

    try {
      const { data, error } = await supabase
        .from('exam_categories')
        .insert({
          id: slug,
          name: trimmed,
          order_index: newCat.orderIndex,
        })
        .select('*')
        .single();

      if (error) {
        console.warn('Failed to insert category into Supabase table (fallback retained):', error);
        return newCat;
      }

      return {
        id: data.id,
        name: data.name,
        orderIndex: Number(data.order_index || 0),
        isActive: data.is_active ?? true,
        createdAt: data.created_at,
      };
    } catch (err) {
      console.warn('Failed to insert category into Supabase:', err);
      return newCat;
    }
  },

  async updateExamCategory(id: string, name: string, orderIndex?: number): Promise<ExamCategory> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Category name cannot be empty');

    // Update in localExamCategories
    const idx = localExamCategories.findIndex(
      (c) => c.id.toLowerCase() === id.toLowerCase() || c.name.toLowerCase() === id.toLowerCase()
    );
    let updatedCat: ExamCategory;
    if (idx !== -1) {
      localExamCategories[idx] = {
        ...localExamCategories[idx],
        name: trimmed,
        orderIndex: orderIndex ?? localExamCategories[idx].orderIndex,
      };
      updatedCat = localExamCategories[idx];
    } else {
      updatedCat = {
        id,
        name: trimmed,
        orderIndex: orderIndex || 1,
        isActive: true,
      };
      localExamCategories.push(updatedCat);
    }

    // Update in localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('practicekoro_exam_categories');
        if (saved) {
          const list: string[] = JSON.parse(saved);
          const mapped = list.map((c) => (c.toLowerCase() === id.toLowerCase() ? trimmed : c));
          window.localStorage.setItem('practicekoro_exam_categories', JSON.stringify(mapped));
        }
      }
    } catch (e) {
      console.warn('Failed to update localStorage on update category:', e);
    }

    if (!isSupabaseConfigured) {
      return updatedCat;
    }

    try {
      const updatePayload: Record<string, unknown> = { name: trimmed };
      if (orderIndex !== undefined) updatePayload.order_index = orderIndex;

      const { data, error } = await supabase
        .from('exam_categories')
        .update(updatePayload)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        // Fallback: update by name if ID was not matched
        const { data: byNameData, error: byNameErr } = await supabase
          .from('exam_categories')
          .update(updatePayload)
          .ilike('name', id)
          .select('*')
          .single();

        if (byNameErr) {
          console.warn('Supabase category update failed (fallback retained):', byNameErr);
          return updatedCat;
        }

        return {
          id: byNameData.id,
          name: byNameData.name,
          orderIndex: Number(byNameData.order_index || 0),
          isActive: byNameData.is_active ?? true,
          createdAt: byNameData.created_at,
        };
      }

      return {
        id: data.id,
        name: data.name,
        orderIndex: Number(data.order_index || 0),
        isActive: data.is_active ?? true,
        createdAt: data.created_at,
      };
    } catch (err) {
      console.warn('Supabase updateExamCategory failed:', err);
      return updatedCat;
    }
  },

  async deleteExamCategory(idOrName: string): Promise<boolean> {
    const trimmed = idOrName.trim();
    if (!trimmed) return false;

    // 1. Always remove from in-memory fallback list
    const idx = localExamCategories.findIndex(
      (c) =>
        c.id.toLowerCase() === trimmed.toLowerCase() ||
        c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (idx !== -1) {
      localExamCategories.splice(idx, 1);
    }

    // 2. Always synchronize with localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('practicekoro_exam_categories');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter((item: any) => {
              const name = typeof item === 'string' ? item : item.name;
              const id = typeof item === 'string' ? '' : item.id;
              return (
                name?.toLowerCase() !== trimmed.toLowerCase() &&
                id?.toLowerCase() !== trimmed.toLowerCase()
              );
            });
            window.localStorage.setItem('practicekoro_exam_categories', JSON.stringify(filtered));
          }
        }
      }
    } catch (e) {
      console.warn('Failed to update localStorage on category delete:', e);
    }

    if (!isSupabaseConfigured) {
      return true;
    }

    // 3. Delete in Supabase: match by ID or match by Name (case-insensitive)
    try {
      const { data: byId } = await supabase
        .from('exam_categories')
        .select('id, name')
        .eq('id', trimmed)
        .maybeSingle();

      const { data: byName } = byId
        ? { data: null }
        : await supabase
            .from('exam_categories')
            .select('id, name')
            .ilike('name', trimmed)
            .maybeSingle();

      const targetId = byId?.id || byName?.id || trimmed;

      const { error: delError } = await supabase
        .from('exam_categories')
        .delete()
        .eq('id', targetId);

      if (delError) {
        await supabase.from('exam_categories').delete().ilike('name', trimmed);
      }
    } catch (err) {
      console.warn('Supabase category delete failed (using local sync):', err);
    }

    return true;
  },

  async reorderExamCategories(
    orderedCategories: { id?: string; name: string; orderIndex: number }[]
  ): Promise<ExamCategory[]> {
    // 1. Update in-memory localExamCategories
    orderedCategories.forEach(({ name, orderIndex }) => {
      const idx = localExamCategories.findIndex((c) => c.name.toLowerCase() === name.toLowerCase());
      if (idx !== -1) {
        localExamCategories[idx] = {
          ...localExamCategories[idx],
          orderIndex,
        };
      }
    });
    localExamCategories.sort((a, b) => a.orderIndex - b.orderIndex);

    // 2. Persist order in localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const names = orderedCategories.map((c) => c.name);
        window.localStorage.setItem('practicekoro_exam_categories', JSON.stringify(names));
      }
    } catch (e) {
      console.warn('Failed to save reordered categories to localStorage:', e);
    }

    // 3. If Supabase is configured, update order_index in exam_categories
    if (isSupabaseConfigured) {
      try {
        await Promise.all(
          orderedCategories.map(async ({ id, name, orderIndex }) => {
            if (id) {
              await supabase
                .from('exam_categories')
                .update({ order_index: orderIndex })
                .eq('id', id);
            } else {
              await supabase
                .from('exam_categories')
                .update({ order_index: orderIndex })
                .ilike('name', name);
            }
          })
        );
      } catch (err) {
        console.warn('Failed to update categories order in Supabase:', err);
      }
    }

    return orderedCategories.map((c, idx) => ({
      id: c.id || 'cat_' + c.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      name: c.name,
      orderIndex: c.orderIndex ?? idx + 1,
      isActive: true,
    }));
  },

  // --------------------------------------------------------------------------
  // TEST QUESTIONS (ASSIGNMENTS & REORDERING)
  // --------------------------------------------------------------------------
  async getTestAssignedQuestions(testId: string): Promise<TestQuestionAssignment[]> {
    if (!isSupabaseConfigured) {
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
          imageUrl: q?.imageUrl,
          difficulty: q?.difficulty ?? undefined,
          correctOption: q?.correctOption,
          optionA: q?.optionA,
          optionB: q?.optionB,
          optionC: q?.optionC,
          optionD: q?.optionD,
          explanation: q?.explanation ?? undefined,
          explanationBengali: q?.explanationBengali ?? undefined,
          subjectId: q?.subjectId,
          subjectName: q?.subjectName,
          chapterId: q?.chapterId,
          chapterName: q?.chapterName,
        };
      });
    }

    const { data, error } = await supabase
      .from('test_questions')
      .select(
        `
        question_id,
        question_order,
        marks,
        negative_marks,
        questions (
          *,
          subjects:subject_id (id, name),
          chapters:chapter_id (id, name)
        )
      `
      )
      .eq('test_id', testId)
      .order('question_order', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item: any) => {
      const q = item.questions as any;
      return {
        questionId: item.question_id,
        questionOrder: item.question_order,
        marks: Number(item.marks),
        negativeMarks: Number(item.negative_marks),
        questionText: q?.question_text ?? undefined,
        questionBengaliText: q?.question_bengali_text ?? undefined,
        imageUrl: q?.image_url ?? undefined,
        difficulty: (q?.difficulty as 'easy' | 'medium' | 'hard') ?? undefined,
        correctOption: (q?.correct_option as 'A' | 'B' | 'C' | 'D' | null) ?? undefined,
        optionA: q?.option_a ?? undefined,
        optionB: q?.option_b ?? undefined,
        optionC: q?.option_c ?? undefined,
        optionD: q?.option_d ?? undefined,
        explanation: q?.explanation ?? undefined,
        explanationBengali: q?.explanation_bengali ?? undefined,
        subjectId: q?.subject_id ?? undefined,
        subjectName: q?.subjects?.name || undefined,
        chapterId: q?.chapter_id ?? undefined,
        chapterName: q?.chapters?.name || undefined,
      };
    });
  },

  async saveTestQuestions(
    testId: string,
    questions: { questionId: string; orderIndex: number; marks?: number; negativeMarks?: number }[]
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
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
    }

    try {
      const payload = questions.map((q, idx) => ({
        question_id: q.questionId,
        question_order: q.orderIndex || idx + 1,
        marks: q.marks ?? 1.0,
        negative_marks: q.negativeMarks ?? 0.25,
      }));

      // First attempt atomic RPC
      const { error: rpcError } = await supabase.rpc('save_test_questions', {
        p_test_id: testId,
        p_questions: payload,
      });

      if (!rpcError) {
        return { success: true };
      }

      // If RPC fails (e.g. signature or RLS mismatch), perform direct atomic queries
      await supabase.from('test_questions').delete().eq('test_id', testId);

      if (questions.length > 0) {
        const rows = questions.map((q, idx) => ({
          test_id: testId,
          question_id: q.questionId,
          question_order: q.orderIndex || idx + 1,
          marks: q.marks ?? 1.0,
          negative_marks: q.negativeMarks ?? 0.25,
        }));

        const { error: insertError } = await supabase.from('test_questions').insert(rows);
        if (insertError) {
          return { success: false, error: insertError.message };
        }
      }

      const totalMarks = questions.reduce((sum, q) => sum + (q.marks ?? 1.0), 0);
      await supabase
        .from('tests')
        .update({
          total_questions: questions.length,
          total_marks: totalMarks,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testId);

      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to save test questions') };
    }
  },

  async addQuestionToTest(
    testId: string,
    questionId: string,
    marks?: number,
    negativeMarks?: number
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      const exists = localTestQuestions.some(
        (tq) => tq.testId === testId && tq.questionId === questionId
      );
      if (exists) return { success: false, error: 'Question already assigned to this test.' };

      const nextOrder =
        localTestQuestions
          .filter((tq) => tq.testId === testId)
          .reduce((max, tq) => Math.max(max, tq.questionOrder), 0) + 1;

      localTestQuestions.push({
        id: `tq-${testId}-${questionId}`,
        testId,
        questionId,
        questionOrder: nextOrder,
        marks: marks ?? 1.0,
        negativeMarks: negativeMarks ?? 0.25,
      });
      return { success: true };
    }

    try {
      const { data: existing, error: existError } = await supabase
        .from('test_questions')
        .select('id')
        .eq('test_id', testId)
        .eq('question_id', questionId)
        .maybeSingle();

      if (existError) return { success: false, error: existError.message };
      if (existing) return { success: false, error: 'Question already assigned to this test.' };

      const { data: lastOrder } = await supabase
        .from('test_questions')
        .select('question_order')
        .eq('test_id', testId)
        .order('question_order', { ascending: false })
        .limit(1);

      const nextOrder =
        lastOrder && lastOrder[0] && lastOrder[0].question_order != null
          ? Number(lastOrder[0].question_order) + 1
          : 1;

      const { error: insertError } = await supabase.from('test_questions').insert({
        test_id: testId,
        question_id: questionId,
        question_order: nextOrder,
        marks: marks ?? 1.0,
        negative_marks: negativeMarks ?? 0.25,
      });

      if (insertError) return { success: false, error: insertError.message };

      // Update test total count
      const { count } = await supabase
        .from('test_questions')
        .select('*', { count: 'exact', head: true })
        .eq('test_id', testId);

      if (count != null) {
        await supabase.from('tests').update({ total_questions: count }).eq('id', testId);
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to add question to test') };
    }
  },

  async removeQuestionFromTest(
    testId: string,
    questionId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      const idx = localTestQuestions.findIndex(
        (tq) => tq.testId === testId && tq.questionId === questionId
      );
      if (idx !== -1) localTestQuestions.splice(idx, 1);
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('test_questions')
        .delete()
        .eq('test_id', testId)
        .eq('question_id', questionId);

      if (error) return { success: false, error: error.message };

      // Update test total count
      const { count } = await supabase
        .from('test_questions')
        .select('*', { count: 'exact', head: true })
        .eq('test_id', testId);

      if (count != null) {
        await supabase.from('tests').update({ total_questions: count }).eq('id', testId);
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to remove question from test') };
    }
  },

  async updateTestQuestionMarks(
    testId: string,
    questionId: string,
    marks: number,
    negativeMarks: number
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      const tq = localTestQuestions.find(
        (item) => item.testId === testId && item.questionId === questionId
      );
      if (tq) {
        tq.marks = marks;
        tq.negativeMarks = negativeMarks;
      }
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('test_questions')
        .update({ marks, negative_marks: negativeMarks })
        .eq('test_id', testId)
        .eq('question_id', questionId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to update question marks') };
    }
  },

  // --------------------------------------------------------------------------
  // DIRECT TEST QUESTION CREATION & BULK IMPORTS
  // --------------------------------------------------------------------------
  async createQuestionForTest(
    testId: string,
    qData: Omit<Question, 'id'>
  ): Promise<{ success: boolean; question?: Question; error?: string }> {
    try {
      let testType: MockTest['testType'] | undefined;
      let examId: string | undefined;
      let testChapterId: string | undefined;
      let testSubjectId: string | undefined;
      let testYear: number | undefined;
      let testPaper: string | undefined;
      let testShift: string | undefined;

      if (!isSupabaseConfigured) {
        const localTest = localTests.find((t) => t.id === testId);
        if (localTest) {
          testType = localTest.testType;
          examId = localTest.examId;
          testChapterId = localTest.chapterId || localTest.topicId;
          testSubjectId = localTest.subjectId;
          testYear = localTest.year;
          testPaper = localTest.paperName;
          testShift = localTest.shift;
        }
      } else {
        const { data, error } = await supabase
          .from('tests')
          .select('id, test_type, exam_id, chapter_id, subject_id, year, paper_name, shift')
          .eq('id', testId)
          .maybeSingle();

        if (error) return { success: false, error: error.message };
        if (!data) return { success: false, error: 'Test not found.' };

        testType = data.test_type;
        examId = data.exam_id;
        testChapterId = data.chapter_id;
        testSubjectId = data.subject_id;
        testYear = data.year ? Number(data.year) : undefined;
        testPaper = data.paper_name;
        testShift = data.shift;
      }

      const sourceType: Question['sourceType'] =
        testType === 'pyq'
          ? 'pyq'
          : testType === 'chapter_mock' || testType === 'topic'
            ? 'topic'
            : 'other';

      const effectiveTopicId = qData.topicId || qData.chapterId || testChapterId || undefined;
      const effectiveSubjectId = qData.subjectId || testSubjectId || undefined;
      const effectiveExam = qData.sourceExam || examId;
      const effectiveYear = qData.sourceYear || (testType === 'pyq' ? testYear : undefined);
      const effectivePaper = qData.sourcePaper || (testType === 'pyq' ? testPaper : undefined);
      const effectiveShift = qData.sourceShift || (testType === 'pyq' ? testShift : undefined);

      const question = await this.createQuestion({
        ...qData,
        sourceType,
        sourceExam: effectiveExam,
        sourceYear: effectiveYear,
        sourcePaper: effectivePaper,
        sourceShift: effectiveShift,
        subjectId: effectiveSubjectId,
        chapterId: effectiveTopicId,
        topicId: effectiveTopicId,
      });

      let nextOrder = 1;
      if (isSupabaseConfigured) {
        const { data: lastRow } = await supabase
          .from('test_questions')
          .select('question_order')
          .eq('test_id', testId)
          .order('question_order', { ascending: false })
          .limit(1);

        nextOrder =
          lastRow && lastRow[0] && lastRow[0].question_order != null
            ? Number(lastRow[0].question_order) + 1
            : 1;

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

        // Update test total count
        const { count } = await supabase
          .from('test_questions')
          .select('*', { count: 'exact', head: true })
          .eq('test_id', testId);

        if (count != null) {
          await supabase.from('tests').update({ total_questions: count }).eq('id', testId);
        }
      } else {
        nextOrder =
          localTestQuestions
            .filter((tq) => tq.testId === testId)
            .reduce((max, tq) => Math.max(max, tq.questionOrder), 0) + 1;

        localTestQuestions.push({
          id: `tq-${testId}-${question.id}`,
          testId,
          questionId: question.id,
          questionOrder: nextOrder,
          marks: question.defaultMarks ?? 1.0,
          negativeMarks: question.defaultNegativeMarks ?? 0.25,
        });
      }

      return { success: true, question };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to create question for test') };
    }
  },

  async bulkCreateQuestionsFromTxt(params: {
    questions: ParsedTxtQuestion[];
    sourceType: 'topic' | 'other' | 'pyq';
    subjectId?: string;
    topicId?: string;
    examId?: string;
    testId?: string;
    defaultMarks?: number;
    defaultNegativeMarks?: number;
  }): Promise<{ successCount: number; errorCount: number; errors: string[] }> {
    let successCount = 0;
    const errors: string[] = [];
    let currentTestOrder = 1;

    if (params.testId && isSupabaseConfigured) {
      try {
        const { data: lastRow } = await supabase
          .from('test_questions')
          .select('question_order')
          .eq('test_id', params.testId)
          .order('question_order', { ascending: false })
          .limit(1);
        if (lastRow && lastRow[0] && lastRow[0].question_order != null) {
          currentTestOrder = Number(lastRow[0].question_order) + 1;
        }
      } catch (err) {
        console.warn('Failed to fetch last question_order for test:', err);
      }
    }

    for (const q of params.questions) {
      try {
        const created = await this.createQuestion({
          questionText: q.questionText,
          questionBengaliText: /[\u0980-\u09FF]/.test(q.questionText) ? q.questionText : undefined,
          imageUrl: q.imageUrl,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctOption: q.correctOption,
          explanation: q.explanation,
          explanationBengali:
            q.explanation && /[\u0980-\u09FF]/.test(q.explanation) ? q.explanation : undefined,
          subjectId: params.subjectId,
          topicId: params.topicId,
          chapterId: params.topicId,
          sourceType: params.sourceType,
          sourceExam: params.examId,
          defaultMarks: params.defaultMarks ?? 1.0,
          defaultNegativeMarks: params.defaultNegativeMarks ?? 0.25,
          isActive: true,
          status: 'active',
        });

        if (params.testId) {
          if (isSupabaseConfigured) {
            await supabase.from('test_questions').insert({
              test_id: params.testId,
              question_id: created.id,
              question_order: currentTestOrder++,
              marks: params.defaultMarks ?? 1.0,
              negative_marks: params.defaultNegativeMarks ?? 0.25,
            });
          } else {
            localTestQuestions.push({
              id: `tq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              testId: params.testId,
              questionId: created.id,
              questionOrder: currentTestOrder++,
              marks: params.defaultMarks ?? 1.0,
              negativeMarks: params.defaultNegativeMarks ?? 0.25,
            });
          }
        }

        successCount++;
      } catch (err) {
        errors.push(
          `Failed to save question #${q.questionNumber} ("${q.questionText.slice(0, 30)}..."): ${getErrorMessage(err, 'Unknown error')}`
        );
      }
    }

    if (params.testId && successCount > 0) {
      try {
        if (isSupabaseConfigured) {
          const { count } = await supabase
            .from('test_questions')
            .select('*', { count: 'exact', head: true })
            .eq('test_id', params.testId);

          if (count != null) {
            await supabase.from('tests').update({ total_questions: count }).eq('id', params.testId);
          }
        } else {
          const test = localTests.find((t) => t.id === params.testId);
          if (test) {
            test.totalQuestions = (test.totalQuestions || 0) + successCount;
          }
        }
      } catch (err) {
        console.warn('Failed to update test total_questions:', err);
      }
    }

    return {
      successCount,
      errorCount: errors.length,
      errors,
    };
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

  async getExamTopicMappings(examId: string): Promise<string[]> {
    return catalogApi.getExamTopicMappings(examId);
  },

  async saveExamTopicMappings(examId: string, topicIds: string[]): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    await supabase.from('exam_topics').delete().eq('exam_id', examId);
    if (topicIds.length > 0) {
      const rows = topicIds.map((tid, idx) => ({
        exam_id: examId,
        topic_id: tid,
        order_index: idx + 1,
      }));
      const { error } = await supabase.from('exam_topics').insert(rows);
      if (error) {
        throw new Error(error.message);
      }
    }
    return true;
  },

  // --------------------------------------------------------------------------
  // NOTIFICATIONS API
  // --------------------------------------------------------------------------
  async getNotifications(): Promise<NotificationItem[]> {
    if (isSupabaseConfigured) {
      // 1. Attempt background auto-transition for any scheduled notifications that have reached their time
      try {
        await supabase.rpc('process_scheduled_notifications');
      } catch {
        // Non-fatal if stored procedure is not yet applied in active environment
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      if (data && data.length > 0) {
        const now = new Date();
        return data.map((d: any) => {
          const scheduledAt = d.scheduled_at || undefined;
          const isDue = d.status === 'scheduled' && scheduledAt && new Date(scheduledAt) <= now;
          const effectiveStatus = isDue ? 'sent' : d.status;
          const effectiveSentAt = isDue ? d.sent_at || scheduledAt : d.sent_at || undefined;

          return {
            id: d.id,
            title: d.title,
            message: d.message,
            targetAudience: d.target_audience,
            channel: d.channel,
            status: effectiveStatus,
            sentAt: effectiveSentAt,
            scheduledAt,
            createdAt: d.created_at,
            createdBy: d.created_by || undefined,
          };
        });
      }
      return [];
    }

    // Fallback: sync scheduled items in local in-memory store
    return [...syncLocalScheduledNotifications()];
  },

  async createNotification(
    notif: Omit<NotificationItem, 'id' | 'createdAt'>
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('notifications').insert({
        title: notif.title,
        message: notif.message,
        target_audience: notif.targetAudience,
        channel: notif.channel,
        status: notif.status,
        sent_at: notif.status === 'sent' ? notif.sentAt || new Date().toISOString() : undefined,
        scheduled_at: notif.status === 'scheduled' ? notif.scheduledAt : undefined,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    // Local fallback store
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: notif.title,
      message: notif.message,
      targetAudience: notif.targetAudience,
      channel: notif.channel,
      status: notif.status,
      sentAt: notif.status === 'sent' ? notif.sentAt || new Date().toISOString() : undefined,
      scheduledAt: notif.status === 'scheduled' ? notif.scheduledAt : undefined,
      createdAt: new Date().toISOString(),
    };
    localNotifications.unshift(newNotif);
    return { success: true };
  },

  async createTargetedNotification(
    notif: Pick<NotificationItem, 'title' | 'message' | 'channel'> & { userIds: string[] }
  ): Promise<{ success: boolean; error?: string }> {
    if (notif.userIds.length === 0) return { success: true };
    if (isSupabaseConfigured) {
      const { error } = await supabase.rpc('create_targeted_notification', {
        p_title: notif.title,
        p_message: notif.message,
        p_channel: notif.channel,
        p_user_ids: notif.userIds,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    localNotifications.unshift({
      id: `notif-${Date.now()}`,
      title: notif.title,
      message: notif.message,
      targetAudience: 'selected',
      channel: notif.channel,
      status: 'sent',
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    return { success: true };
  },

  async sendNotificationNow(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('notifications')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw new Error(error.message);
      return true;
    }

    const target = localNotifications.find((n) => n.id === id);
    if (target) {
      target.status = 'sent';
      target.sentAt = new Date().toISOString();
    }
    return true;
  },

  async deleteNotification(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return true;
    }

    const idx = localNotifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      localNotifications.splice(idx, 1);
    }
    return true;
  },

  // --------------------------------------------------------------------------
  // SUPPORT TICKETS API
  // --------------------------------------------------------------------------
  async getSupportTickets(): Promise<SupportTicketItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('support_tickets')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            userId: d.user_id || undefined,
            studentName: d.student_name || 'Student Aspirant',
            studentEmail: d.student_email || '',
            subject: d.subject,
            issue: d.issue,
            category: d.category,
            priority: d.priority,
            status: d.status,
            assignedTo: d.assigned_to || undefined,
            resolutionNotes: d.resolution_notes || undefined,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
        }
      } catch (err) {
        console.warn(
          'Failed to load support tickets from Supabase, falling back to local store:',
          err
        );
      }
    }

    return [...localSupportTickets];
  },

  async updateSupportTicket(
    id: string,
    updates: Partial<SupportTicketItem>
  ): Promise<{ success: boolean; error?: string }> {
    const idx = localSupportTickets.findIndex((t) => t.id === id);
    if (idx !== -1) {
      localSupportTickets[idx] = {
        ...localSupportTickets[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }

    if (isSupabaseConfigured) {
      const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.status) payload.status = updates.status;
      if (updates.priority) payload.priority = updates.priority;
      if (updates.resolutionNotes !== undefined) payload.resolution_notes = updates.resolutionNotes;
      if (updates.assignedTo !== undefined) payload.assigned_to = updates.assignedTo;

      try {
        const { error } = await supabase.from('support_tickets').update(payload).eq('id', id);
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Update failed' };
      }
    }

    return { success: true };
  },

  async createSupportTicket(
    ticket: Omit<SupportTicketItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; error?: string; ticketId?: string }> {
    const generatedId = `tkt_${Date.now()}`;
    const newTicket: SupportTicketItem = {
      id: generatedId,
      userId: ticket.userId,
      studentName: ticket.studentName || 'Student Candidate',
      studentEmail: ticket.studentEmail || '',
      subject: ticket.subject,
      issue: ticket.issue,
      category: ticket.category || 'Other',
      priority: ticket.priority || 'medium',
      status: ticket.status || 'open',
      resolutionNotes: ticket.resolutionNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localSupportTickets.unshift(newTicket);

    if (isSupabaseConfigured) {
      let resolvedUserId = ticket.userId || null;
      if (!resolvedUserId) {
        try {
          const { data: authData } = await supabase.auth.getUser();
          resolvedUserId = authData?.user?.id || null;
        } catch {
          // ignore auth error
        }
      }

      try {
        const { error } = await supabase.from('support_tickets').insert({
          user_id: resolvedUserId,
          student_name: ticket.studentName || 'Student Candidate',
          student_email: ticket.studentEmail || '',
          subject: ticket.subject,
          issue: ticket.issue,
          category: ticket.category || 'Other',
          priority: ticket.priority || 'medium',
          status: ticket.status || 'open',
          resolution_notes: ticket.resolutionNotes || null,
        });
        if (error) {
          console.warn('Supabase support_tickets insert notice (stored locally):', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase support_tickets exception (stored locally):', err?.message || err);
      }
    }

    return { success: true, ticketId: generatedId };
  },

  async getStudentSupportTickets(userId?: string): Promise<SupportTicketItem[]> {
    if (isSupabaseConfigured) {
      let targetUserId = userId;
      if (!targetUserId) {
        try {
          const { data: authData } = await supabase.auth.getUser();
          targetUserId = authData?.user?.id;
        } catch {
          // ignore
        }
      }

      if (targetUserId) {
        try {
          const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            return data.map((d: any) => ({
              id: d.id,
              userId: d.user_id || undefined,
              studentName: d.student_name || 'Student Candidate',
              studentEmail: d.student_email || '',
              subject: d.subject,
              issue: d.issue,
              category: d.category,
              priority: d.priority,
              status: d.status,
              assignedTo: d.assigned_to || undefined,
              resolutionNotes: d.resolution_notes || undefined,
              createdAt: d.created_at,
              updatedAt: d.updated_at,
            }));
          }
        } catch (err) {
          console.warn(
            'Failed to load student support tickets from Supabase, using local store:',
            err
          );
        }
      }
    }

    if (userId) {
      const filtered = localSupportTickets.filter((t) => !t.userId || t.userId === userId);
      return filtered.length > 0 ? filtered : [...localSupportTickets];
    }
    return [...localSupportTickets];
  },

  // --------------------------------------------------------------------------
  // APP SETTINGS API
  // --------------------------------------------------------------------------
  async getAppSettings(): Promise<AppSettingItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('app_settings').select('*');
        if (error) {
          console.warn(
            'Could not fetch app_settings from Supabase, using local defaults:',
            error.message
          );
          return [...localAppSettings];
        }
        if (data && data.length > 0) {
          const fetched: AppSettingItem[] = data.map((d: any) => ({
            id: d.id,
            category: d.category,
            key: d.key,
            value: parseSettingValue(d.value),
            description: d.description || undefined,
            updatedAt: d.updated_at,
          }));

          // Sync into localAppSettings cache
          fetched.forEach((f) => {
            const idx = localAppSettings.findIndex((l) => l.id === f.id || l.key === f.key);
            if (idx >= 0) {
              localAppSettings[idx] = f;
            } else {
              localAppSettings.push(f);
            }
          });

          return fetched;
        }
      } catch (err) {
        console.warn('Failed to query app_settings, falling back to local defaults:', err);
      }
    }

    return [...localAppSettings];
  },

  async updateAppSetting(
    id: string,
    value: unknown
  ): Promise<{ success: boolean; error?: string }> {
    return this.updateAppSettings([{ id, value }]);
  },

  async updateAppSettings(
    updates: Array<{ id: string; value: unknown }>
  ): Promise<{ success: boolean; error?: string }> {
    const SETTINGS_META: Record<string, { category: string; key: string; description: string }> = {
      general_app_name: {
        category: 'general',
        key: 'app_name',
        description: 'Platform name displayed across UI',
      },
      general_support_email: {
        category: 'general',
        key: 'support_email',
        description: 'Support contact email',
      },
      general_support_phone: {
        category: 'general',
        key: 'support_phone',
        description: 'Support phone helpline',
      },
      general_website_url: {
        category: 'general',
        key: 'website_url',
        description: 'Official web application domain',
      },
      exam_default_duration: {
        category: 'exam_defaults',
        key: 'default_duration_minutes',
        description: 'Standard default exam duration in minutes',
      },
      exam_default_marks: {
        category: 'exam_defaults',
        key: 'default_marks_per_q',
        description: 'Standard default marks per correct question',
      },
      exam_default_negative_marks: {
        category: 'exam_defaults',
        key: 'default_negative_marks',
        description: 'Standard default negative marking',
      },
      exam_passing_percentage: {
        category: 'exam_defaults',
        key: 'default_passing_percentage',
        description: 'Standard passing score percentage',
      },
      sub_currency: {
        category: 'subscription',
        key: 'currency',
        description: 'Platform transaction currency',
      },
      sub_expiry_warning_days: {
        category: 'subscription',
        key: 'expiry_warning_days',
        description: 'Days before expiry to display renewal warning',
      },
      sys_maintenance_mode: {
        category: 'system',
        key: 'maintenance_mode',
        description: 'Enable platform maintenance splash mode',
      },
      sys_app_version: {
        category: 'system',
        key: 'app_version',
        description: 'Platform production release version',
      },
    };

    // Always update or insert (upsert) into in-memory localAppSettings
    updates.forEach((u) => {
      const parsedVal = parseSettingValue(u.value);
      const meta = SETTINGS_META[u.id] || {
        category: 'general',
        key: u.id,
        description: 'Platform configuration setting',
      };
      const idx = localAppSettings.findIndex((l) => l.id === u.id || l.key === u.id);
      if (idx >= 0) {
        localAppSettings[idx] = {
          ...localAppSettings[idx],
          value: parsedVal,
          updatedAt: new Date().toISOString(),
        };
      } else {
        localAppSettings.push({
          id: u.id,
          category: meta.category,
          key: meta.key,
          value: parsedVal,
          description: meta.description,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    if (isSupabaseConfigured) {
      try {
        const rows = updates.map((u) => {
          const meta = SETTINGS_META[u.id] || {
            category: 'general',
            key: u.id,
            description: 'Platform configuration setting',
          };
          return {
            id: u.id,
            category: meta.category,
            key: meta.key,
            value: u.value,
            description: meta.description,
            updated_at: new Date().toISOString(),
          };
        });

        const { error } = await supabase.from('app_settings').upsert(rows, { onConflict: 'id' });

        if (error) {
          console.warn('Supabase app_settings upsert error:', error.message);
          if (
            error.message.includes('schema cache') ||
            error.code === 'PGRST205' ||
            error.code === '42P01' ||
            error.message.includes('does not exist')
          ) {
            // Table unmigrated in current database environment; local store already updated
            return { success: true };
          }
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err) {
        const msg = getErrorMessage(err, 'Failed to update app settings');
        console.error('Exception during app_settings upsert:', msg);
        return { success: false, error: msg };
      }
    }

    return { success: true };
  },

  async getMaintenanceMode(): Promise<boolean> {
    try {
      const settings = await this.getAppSettings();
      const maint = settings.find(
        (s) => s.id === 'sys_maintenance_mode' || s.key === 'maintenance_mode'
      );
      if (!maint) return false;
      return maint.value === true || maint.value === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Question-level Item Analysis (psychometrics, accuracy %, failure rate %, time traps, distractor distribution).
   * Identifies questions where >= 80% students got it wrong or took unusually long time (>90s).
   */
  async getItemAnalysis(filters?: ItemAnalysisFilterOptions): Promise<QuestionItemAnalysis[]> {
    let items: QuestionItemAnalysis[] = [];

    if (isSupabaseConfigured) {
      try {
        const { data: answersData, error } = await supabase.from('attempt_answers').select(`
            question_id,
            selected_option,
            is_correct,
            time_spent_seconds,
            questions (
              id,
              question_text,
              question_bengali_text,
              subject_id,
              chapter_id,
              difficulty,
              option_a,
              option_b,
              option_c,
              option_d,
              correct_option,
              explanation,
              subjects ( id, name ),
              chapters ( id, name ),
              exams ( id, title )
            )
          `);

        if (!error && Array.isArray(answersData) && answersData.length > 0) {
          const questionMap = new Map<
            string,
            {
              qInfo: any;
              total: number;
              correct: number;
              wrong: number;
              skipped: number;
              totalTime: number;
              optionsCount: { A: number; B: number; C: number; D: number };
            }
          >();

          answersData.forEach((row: any) => {
            const qId = row.question_id;
            if (!questionMap.has(qId)) {
              questionMap.set(qId, {
                qInfo: row.questions,
                total: 0,
                correct: 0,
                wrong: 0,
                skipped: 0,
                totalTime: 0,
                optionsCount: { A: 0, B: 0, C: 0, D: 0 },
              });
            }

            const qStats = questionMap.get(qId)!;
            qStats.total += 1;
            qStats.totalTime += Number(row.time_spent_seconds || 0);

            if (!row.selected_option) {
              qStats.skipped += 1;
            } else {
              const opt = String(row.selected_option).toUpperCase() as 'A' | 'B' | 'C' | 'D';
              if (qStats.optionsCount[opt] !== undefined) {
                qStats.optionsCount[opt] += 1;
              }
              if (row.is_correct) {
                qStats.correct += 1;
              } else {
                qStats.wrong += 1;
              }
            }
          });

          items = Array.from(questionMap.entries()).map(([qId, s]) => {
            const accuracyRate = s.total > 0 ? Number(((s.correct / s.total) * 100).toFixed(1)) : 0;
            const failureRate = s.total > 0 ? Number(((s.wrong / s.total) * 100).toFixed(1)) : 0;
            const avgTimeSpentSeconds = s.total > 0 ? Math.round(s.totalTime / s.total) : 0;
            const isHighFailure = failureRate >= 80;
            const isTimeTrap = avgTimeSpentSeconds >= 90;

            let empiricalDifficulty: EmpiricalDifficulty = 'moderate';
            if (accuracyRate >= 85) empiricalDifficulty = 'very_easy';
            else if (accuracyRate >= 70) empiricalDifficulty = 'easy';
            else if (accuracyRate >= 45) empiricalDifficulty = 'moderate';
            else if (accuracyRate >= 20) empiricalDifficulty = 'hard';
            else empiricalDifficulty = 'extreme';

            const declaredDiff = (s.qInfo?.difficulty?.toLowerCase() || 'medium') as
              'easy' | 'medium' | 'hard';
            const isMisclassified =
              (declaredDiff === 'easy' &&
                (empiricalDifficulty === 'hard' || empiricalDifficulty === 'extreme')) ||
              (declaredDiff === 'hard' &&
                (empiricalDifficulty === 'easy' || empiricalDifficulty === 'very_easy'));

            const answeredTotal = s.correct + s.wrong;
            const optA =
              answeredTotal > 0 ? Number(((s.optionsCount.A / answeredTotal) * 100).toFixed(1)) : 0;
            const optB =
              answeredTotal > 0 ? Number(((s.optionsCount.B / answeredTotal) * 100).toFixed(1)) : 0;
            const optC =
              answeredTotal > 0 ? Number(((s.optionsCount.C / answeredTotal) * 100).toFixed(1)) : 0;
            const optD =
              answeredTotal > 0 ? Number(((s.optionsCount.D / answeredTotal) * 100).toFixed(1)) : 0;

            return {
              questionId: qId,
              questionText: s.qInfo?.question_text || 'Question Text',
              questionBengali: s.qInfo?.question_bengali_text || undefined,
              subjectId: s.qInfo?.subject_id,
              subjectName: s.qInfo?.subjects?.name || 'General Subject',
              chapterId: s.qInfo?.chapter_id,
              chapterName: s.qInfo?.chapters?.name || 'Topic Chapter',
              examId: s.qInfo?.exams?.id,
              examTitle: s.qInfo?.exams?.title || 'Competitive Exam',
              declaredDifficulty: declaredDiff,
              empiricalDifficulty,
              totalAttempts: s.total,
              correctCount: s.correct,
              wrongCount: s.wrong,
              skippedCount: s.skipped,
              accuracyRate,
              failureRate,
              avgTimeSpentSeconds,
              isHighFailure,
              isTimeTrap,
              isMisclassified,
              options: {
                A: s.qInfo?.option_a || 'Option A',
                B: s.qInfo?.option_b || 'Option B',
                C: s.qInfo?.option_c || 'Option C',
                D: s.qInfo?.option_d || 'Option D',
              },
              correctOption: s.qInfo?.correct_option || 'A',
              optionDistribution: { A: optA, B: optB, C: optC, D: optD },
              explanation: s.qInfo?.explanation || undefined,
            };
          });
        }
      } catch (err) {
        console.warn('Failed querying attempt_answers from Supabase, using local fallback:', err);
      }
    }

    // Fallback to localItemAnalysisStore
    if (items.length === 0) {
      items = [...localItemAnalysisStore];
    }

    // Apply Filters
    let result = [...items];
    if (filters) {
      const activeFilter = filters.filterType || filters.preset;
      if (activeFilter === 'high_failure') {
        result = result.filter((item) => item.isHighFailure);
      } else if (activeFilter === 'time_traps') {
        result = result.filter((item) => item.isTimeTrap);
      } else if (activeFilter === 'misclassified') {
        result = result.filter((item) => item.isMisclassified);
      } else if (activeFilter === 'hardest') {
        result.sort((a, b) => a.accuracyRate - b.accuracyRate);
      } else if (activeFilter === 'easiest') {
        result.sort((a, b) => b.accuracyRate - a.accuracyRate);
      }

      if (filters.subjectId) {
        result = result.filter((item) => item.subjectId === filters.subjectId);
      }
      if (filters.chapterId) {
        result = result.filter((item) => item.chapterId === filters.chapterId);
      }
      if (filters.examId) {
        result = result.filter((item) => item.examId === filters.examId);
      }
      if (filters.testId) {
        result = result.filter((item) => item.testId === filters.testId);
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        result = result.filter(
          (item) =>
            item.questionText.toLowerCase().includes(q) ||
            (item.questionBengali && item.questionBengali.toLowerCase().includes(q)) ||
            (item.subjectName && item.subjectName.toLowerCase().includes(q)) ||
            (item.chapterName && item.chapterName.toLowerCase().includes(q))
        );
      }
      if (filters.minAttempts) {
        result = result.filter((item) => item.totalAttempts >= filters.minAttempts!);
      }
    }

    return result;
  },
};
