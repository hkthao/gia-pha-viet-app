import { useMemo, useCallback } from 'react';
import { useFamilyListStore, FamilyListStore } from '@/stores/useFamilyListStore'; // Corrected import
import { SearchFamiliesQuery } from '@/types';

export function useFamilySearchPaginatedStore() {
  const items = useFamilyListStore((state: FamilyListStore) => state.items);
  const loading = useFamilyListStore((state: FamilyListStore) => state.loading);
  const error = useFamilyListStore((state: FamilyListStore) => state.error);
  const hasMore = useFamilyListStore((state: FamilyListStore) => state.hasMore);
  const page = useFamilyListStore((state: FamilyListStore) => state.page);

  // Extract stable actions directly
  const searchAction = useFamilyListStore((state: FamilyListStore) => state.search);
  const resetAction = useFamilyListStore((state: FamilyListStore) => state.reset);
  const setErrorAction = useFamilyListStore((state: FamilyListStore) => state.setError);

  // Memoize the refresh and loadMore functions using useCallback to ensure their stability
  const refresh = useCallback(
    async (query: SearchFamiliesQuery) =>
      searchAction({ ...query, page: 1 }, true),
    [searchAction]
  );

  const loadMore = useCallback(
    async (query: SearchFamiliesQuery) =>
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