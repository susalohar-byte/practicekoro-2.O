import { supabaseRuntime as supabase, isSupabaseConfigured } from '@/lib/supabase';
import { localChapters, localTests } from '@/services/domains/localStore';
import type { Chapter } from '@/types';
import type { ChapterRow } from '@/services/domains/localStore';

/** Section of the admin API: chapters (split from domains/admin.ts, same behaviour). */
// --------------------------------------------------------------------------
// CHAPTERS / TOPICS API
// --------------------------------------------------------------------------
export async function getAllAdminChapters(subjectId?: string): Promise<Chapter[]> {
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
}

export async function getChapterById(id: string): Promise<Chapter | null> {
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
}

export async function createChapter(chapterData: Omit<Chapter, 'id'>): Promise<Chapter> {
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
}

export async function updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter> {
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
}

export async function deleteChapter(id: string): Promise<boolean> {
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
}

export const adminChaptersApi = {
  getAllAdminChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
};
