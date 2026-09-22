import { supabaseRuntime as supabase, isSupabaseConfigured } from '@/lib/supabase';
import { localExams, localTestSeries, localTests } from '@/services/domains/localStore';
import type { TestSeries } from '@/types';

/** Section of the admin API: testSeries (split from domains/admin.ts, same behaviour). */
// --------------------------------------------------------------------------
// TEST SERIES API
// --------------------------------------------------------------------------
export async function getTestSeries(examId?: string): Promise<TestSeries[]> {
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
}

export async function createTestSeries(seriesData: Omit<TestSeries, 'id'>): Promise<TestSeries> {
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
}

export async function updateTestSeries(
  id: string,
  updates: Partial<TestSeries>
): Promise<TestSeries> {
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
}

export async function deleteTestSeries(id: string): Promise<boolean> {
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
}

export const adminTestSeriesApi = {
  getTestSeries,
  createTestSeries,
  updateTestSeries,
  deleteTestSeries,
};
