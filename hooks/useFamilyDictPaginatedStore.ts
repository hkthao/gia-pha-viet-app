import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePublicFamilyDictStore } from '@/stores/usePublicFamilyDictStore';
import { FamilyDictDto, FamilyDictFilter } from '@/types';
import { ZustandPaginatedStore } from '@/hooks/usePaginatedSearch';
import { QueryParams } from '@/utils/core/queryUtils';

export function useFamilyDictPaginatedStore(): ZustandPaginatedStore<FamilyDictDto, FamilyDictFilter> {
  const { t } = useTranslation();
  const { familyDicts, loading, error, hasMore, page, fetchFamilyDicts, reset, setError } = usePublicFamilyDictStore();

  const mappedStore: ZustandPaginatedStore<FamilyDictDto, FamilyDictFilter> = useMemo(() => ({
    items: familyDicts,
    loading,
    error,
    hasMore,
    page,
    fetch: async (filter: FamilyDictFilter, isLoadMore: boolean) => {
      // The fetchFamilyDicts function already handles page increment internally if isLoadMore is true
      // It also accepts page and itemsPerPage directly
      return fetchFamilyDicts(filter, isLoadMore ? page + 1 : 1, 10, !isLoadMore);
    },
    reset,
    setError,
  }), [familyDicts, loading, error, hasMore, page, fetchFamilyDicts, reset, setError]);

  return mappedStore;
}