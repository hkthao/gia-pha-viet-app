import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePublicFamilyDictStore } from '@/stores/usePublicFamilyDictStore';
import { FamilyDictDto, FamilyDictSearchQuery } from '@/types';
import { ZustandPaginatedStore } from '@/hooks/usePaginatedSearch';

export function useFamilyDictPaginatedStore(): ZustandPaginatedStore<FamilyDictDto, FamilyDictSearchQuery> {
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

  // Memoize the fetch function using useCallback to ensure its stability
  const fetch = useCallback(
    async (filter: FamilyDictSearchQuery, isLoadMore: boolean) => {
      const newFilter: FamilyDictSearchQuery = {
        ...filter,
        page: isLoadMore ? page + 1 : 1,
        itemsPerPage: filter.itemsPerPage || 10, // Use 10 as default if not provided
      };
      return searchAction(newFilter, !isLoadMore);
    },
    [searchAction, page]
  );

  const mappedStore: ZustandPaginatedStore<FamilyDictDto, FamilyDictSearchQuery> = useMemo(() => ({
    items: items,
    loading,
    error,
    hasMore,
    page,
    fetch: fetch,
    reset: resetAction,
    setError: setErrorAction,
  }), [items, loading, error, hasMore, page, fetch, resetAction, setErrorAction]);

  return mappedStore;
}