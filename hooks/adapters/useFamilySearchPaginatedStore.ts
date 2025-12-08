import { useMemo, useCallback } from 'react';
import { usePublicFamilyStore } from '@/stores/usePublicFamilyStore';
import { FamilyListDto, SearchPublicFamiliesQuery } from '@/types';
import { ZustandPaginatedStore } from '@/hooks/usePaginatedSearch';

export function useFamilySearchPaginatedStore(): ZustandPaginatedStore<FamilyListDto, SearchPublicFamiliesQuery> {
  const families = usePublicFamilyStore((state) => state.families);
  const loading = usePublicFamilyStore((state) => state.loading);
  const error = usePublicFamilyStore((state) => state.error);
  const hasMore = usePublicFamilyStore((state) => state.hasMore);
  const page = usePublicFamilyStore((state) => state.page);

  // Extract stable actions directly
  const fetchFamiliesAction = usePublicFamilyStore((state) => state.fetchFamilies);
  const resetAction = usePublicFamilyStore((state) => state.reset);
  const setErrorAction = usePublicFamilyStore((state) => state.setError);

  // Memoize the fetch function using useCallback to ensure its stability
  const fetch = useCallback(
    async (query: SearchPublicFamiliesQuery, isLoadMore: boolean) =>
      fetchFamiliesAction({ ...query, page: query.page || 1 }, isLoadMore),
    [fetchFamiliesAction]
  );

  const mappedStore: ZustandPaginatedStore<FamilyListDto, SearchPublicFamiliesQuery> = useMemo(() => ({
    items: families,
    loading: loading,
    error: error,
    hasMore: hasMore,
    page: page,
    fetch: fetch,
    reset: resetAction,
    setError: setErrorAction,
  }), [
    fetch,
    resetAction,
    setErrorAction,
  ]);

  return mappedStore;
}