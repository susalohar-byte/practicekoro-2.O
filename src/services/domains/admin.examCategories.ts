import { supabaseRuntime as supabase, isSupabaseConfigured } from '@/lib/supabase';
import { localExamCategories } from '@/services/domains/localStore';
import type { ExamCategory } from '@/types';

/** Section of the admin API: examCategories (split from domains/admin.ts, same behaviour). */
// --------------------------------------------------------------------------
// EXAM CATEGORIES (DATABASE BACKED WITH LOCAL FALLBACK & ORDER PERSISTENCE)
// --------------------------------------------------------------------------
export function getLocalExamCategoriesWithPersistence(): ExamCategory[] {
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
}

export async function getExamCategories(): Promise<ExamCategory[]> {
  if (!isSupabaseConfigured) {
    return getLocalExamCategoriesWithPersistence();
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
    return getLocalExamCategoriesWithPersistence();
  } catch (err) {
    console.warn('Failed to load categories from Supabase, using local fallback:', err);
    return getLocalExamCategoriesWithPersistence();
  }
}

export async function createExamCategory(name: string, orderIndex?: number): Promise<ExamCategory> {
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
}

export async function updateExamCategory(
  id: string,
  name: string,
  orderIndex?: number
): Promise<ExamCategory> {
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
}

export async function deleteExamCategory(idOrName: string): Promise<boolean> {
  const trimmed = idOrName.trim();
  if (!trimmed) return false;

  // 1. Always remove from in-memory fallback list
  const idx = localExamCategories.findIndex(
    (c) =>
      c.id.toLowerCase() === trimmed.toLowerCase() || c.name.toLowerCase() === trimmed.toLowerCase()
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

    const { error: delError } = await supabase.from('exam_categories').delete().eq('id', targetId);

    if (delError) {
      await supabase.from('exam_categories').delete().ilike('name', trimmed);
    }
  } catch (err) {
    console.warn('Supabase category delete failed (using local sync):', err);
  }

  return true;
}

export async function reorderExamCategories(
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
            await supabase.from('exam_categories').update({ order_index: orderIndex }).eq('id', id);
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
}

export const adminExamCategoriesApi = {
  getLocalExamCategoriesWithPersistence,
  getExamCategories,
  createExamCategory,
  updateExamCategory,
  deleteExamCategory,
  reorderExamCategories,
};
