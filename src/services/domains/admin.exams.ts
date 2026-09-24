import { supabaseRuntime as supabase, isSupabaseConfigured } from '@/lib/supabase';
import { localExams, localTests } from '@/services/domains/localStore';
import { notifyExamsUpdated } from '@/lib/dataSync';
import type { Exam } from '@/types';
import type { ExamRow } from '@/services/domains/localStore';

/** Section of the admin API: exams (split from domains/admin.ts, same behaviour). */
// Per-exam content counts by test type. Topic tests are reusable across
// exams via the test_exams junction, so an exam's topic count includes
// tests associated through that junction (matching the student catalog).
export async function getExamContentCounts(): Promise<
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
}

// --------------------------------------------------------------------------
// EXAMS API
// --------------------------------------------------------------------------
export async function getAllAdminExams(): Promise<Exam[]> {
  if (!isSupabaseConfigured) {
    const contentCounts = await getExamContentCounts();
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
    getExamContentCounts(),
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
}

export async function getExamById(id: string): Promise<Exam | null> {
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
}

export async function createExam(examData: Omit<Exam, 'id'>): Promise<Exam> {
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
    notifyExamsUpdated();
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

  notifyExamsUpdated();
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
}

export async function updateExam(id: string, updates: Partial<Exam>): Promise<Exam> {
  if (!isSupabaseConfigured) {
    const existingIndex = localExams.findIndex((e) => e.id === id);
    if (existingIndex !== -1) {
      localExams[existingIndex] = { ...localExams[existingIndex], ...updates };
    }
    notifyExamsUpdated();
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

  notifyExamsUpdated();
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
}

export async function deleteExam(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    const idx = localExams.findIndex((e) => e.id === id);
    if (idx !== -1) localExams.splice(idx, 1);
    notifyExamsUpdated();
    return true;
  }

  // Clean up dependent associations
  await supabase.from('test_exams').delete().eq('exam_id', id);
  await supabase.from('exam_topics').delete().eq('exam_id', id);

  const { error } = await supabase.from('exams').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
  notifyExamsUpdated();
  return true;
}

export const adminExamsApi = {
  getExamContentCounts,
  getAllAdminExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
};
