import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFamilyDictStore } from '@/stores/useFamilyDictStore';
import { FamilyDictDto, FamilyDictSearchQuery } from '@/types';


export function useFamilyDictPaginatedStore() {
  const { t } = useTranslation();

  const items = useFamilyDictStore((state) => state.items);
  const loading = useFamilyDictStore((state) => state.loading);
  const error = useFamilyDictStore((state) => state.error);
  const hasMore = useFamilyDictStore((state) => state.hasMore);
  const page = useFamilyDictStore((state) => state.page);

  // Extract stable actions directly
  const searchAction = useFamilyDictStore((state) => state.search);
  const resetAction = useFamilyDictStore((state) => state.reset);
  const setErrorAction = useFamilyDictStore((state) => state.setError);

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