import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

/**
 * Canonical curriculum query for the admin console.
 *
 * Replaces hand-rolled useEffect+useState fetching with a cached TanStack
 * Query: 5-minute stale time, no refetch on window focus, automatic
 * dedup when multiple admin screens mount at once. Mutations should call
 * `refetch()` (or invalidate ['admin', 'curriculum']) after writes.
 */
export function useAdminCurriculum() {
  return useQuery({
    queryKey: ['admin', 'curriculum'],
    queryFn: async () => {
      const [subjects, chapters, questions] = await Promise.all([
        api.getAllAdminSubjects(),
        api.getAllAdminChapters(),
        api.getAllAdminQuestions(),
      ]);
      return { subjects, chapters, questions };
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
