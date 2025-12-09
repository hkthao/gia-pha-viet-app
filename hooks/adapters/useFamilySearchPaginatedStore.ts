import { useMemo, useCallback } from 'react';
import { usePublicFamilyStore } from '@/stores/usePublicFamilyStore';
import { FamilyListDto, SearchPublicFamiliesQuery } from '@/types';

export function useFamilySearchPaginatedStore() {
  const items = usePublicFamilyStore((state) => state.items);
  const loading = usePublicFamilyStore((state) => state.loading);
  const error = usePublicFamilyStore((state) => state.error);
  const hasMore = usePublicFamilyStore((state) => state.hasMore);
  const page = usePublicFamilyStore((state) => state.page);

  // Extract stable actions directly
  const searchAction = usePublicFamilyStore((state) => state.search);
  const resetAction = usePublicFamilyStore((state) => state.reset);
  const setErrorAction = usePublicFamilyStore((state) => state.setError);

  // Memoize the refresh and loadMore functions using useCallback to ensure their stability
  const refresh = useCallback(
    async (query: SearchPublicFamiliesQuery) =>
      searchAction({ ...query, page: 1 }, true),
    [searchAction]
  );

  const loadMore = useCallback(
    async (query: SearchPublicFamiliesQuery) =>
      searchAction({ ...query, page: page + 1 }, false),
    [searchAction, page]
  );

  const mappedStore = useMemo(() => ({
    items: items,
    loading: loading,
    error: error,
    hasMore: hasMore,
    page: page,
    refresh: refresh,
    loadMore: loadMore,
    reset: resetAction,
    setError: setErrorAction,
  }), [
    items,
    loading,
    error,
    hasMore,
    page,
    refresh,
    loadMore,
    resetAction,
    setErrorAction,
  ]);

  return mappedStore;
}