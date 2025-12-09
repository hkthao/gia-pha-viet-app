import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePublicFamilyDictStore } from '@/stores/usePublicFamilyDictStore';
import { FamilyDictDto, FamilyDictSearchQuery } from '@/types';


export function useFamilyDictPaginatedStore() {
  const { t } = useTranslation();

  const items = usePublicFamilyDictStore((state) => state.items);
  const loading = usePublicFamilyDictStore((state) => state.loading);
  const error = usePublicFamilyDictStore((state) => state.error);
  const hasMore = usePublicFamilyDictStore((state) => state.hasMore);
  const page = usePublicFamilyDictStore((state) => state.page);

  // Extract stable actions directly
  const searchAction = usePublicFamilyDictStore((state) => state.search);
  const resetAction = usePublicFamilyDictStore((state) => state.reset);
  const setErrorAction = usePublicFamilyDictStore((state) => state.setError);

  // Memoize the fetch and loadMore functions using useCallback to ensure their stability
  const refresh = useCallback(
    async (filter: FamilyDictSearchQuery) => {
      const newFilter: FamilyDictSearchQuery = {
        ...filter,
        page: 1,
        itemsPerPage: filter.itemsPerPage || 10,
      };
      return searchAction(newFilter, true);
    },
    [searchAction]
  );

  const loadMore = useCallback(
    async (filter: FamilyDictSearchQuery) => {
      const newFilter: FamilyDictSearchQuery = {
        ...filter,
        page: page + 1,
        itemsPerPage: filter.itemsPerPage || 10,
      };
      return searchAction(newFilter, false);
    },
    [searchAction, page]
  );

  const mappedStore = useMemo(() => ({
    items: items,
    loading,
    error,
    hasMore,
    page,
    refresh,
    loadMore,
    reset: resetAction,
    setError: setErrorAction,
  }), [items, loading, error, hasMore, page, refresh, loadMore, resetAction, setErrorAction]);

  return mappedStore;
}