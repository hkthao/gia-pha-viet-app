import { useMemo } from 'react';
import { usePublicFamilyStore } from '@/stores/usePublicFamilyStore';
import { FamilyListDto, SearchPublicFamiliesQuery } from '@/types';
import { ZustandPaginatedStore } from '@/hooks/usePaginatedSearch';

export function useFamilySearchPaginatedStore(): ZustandPaginatedStore<FamilyListDto, SearchPublicFamiliesQuery> {
  const store = usePublicFamilyStore();

  const mappedStore: ZustandPaginatedStore<FamilyListDto, SearchPublicFamiliesQuery> = useMemo(() => ({
    items: store.families,
    loading: store.loading,
    error: store.error,
    hasMore: store.hasMore,
    page: store.page,
    fetch: async (query, isLoadMore) =>
      store.fetchFamilies({ ...query, page: query.page || 1 }, isLoadMore),
    reset: store.reset,
    setError: store.setError,
  }), [
    store.families,
    store.loading,
    store.error,
    store.hasMore,
    store.page,
    store.fetchFamilies,
    store.reset,
    store.setError
  ]);

  return mappedStore;
}