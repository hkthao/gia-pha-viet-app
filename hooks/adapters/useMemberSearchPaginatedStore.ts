import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useMemberStore, MemberStore } from '@/stores/useMemberStore'; // Import MemberStore type
import { MemberListDto, SearchMembersQuery } from '@/types';

export function useMemberSearchPaginatedStore(currentFamilyId: string | null) {
  const { t } = useTranslation();

  const items = useMemberStore((state: MemberStore) => state.items);
  const loading = useMemberStore((state: MemberStore) => state.loading);
  const error = useMemberStore((state: MemberStore) => state.error);
  const hasMore = useMemberStore((state: MemberStore) => state.hasMore);
  const page = useMemberStore((state: MemberStore) => state.page);

  // Extract stable actions directly
  const searchAction = useMemberStore((state: MemberStore) => state.search);
  const resetAction = useMemberStore((state: MemberStore) => state.reset);
  const setErrorAction = useMemberStore((state: MemberStore) => state.setError);

  // Memoize the refresh and loadMore functions using useCallback to ensure their stability
  const refresh = useCallback(
    async (query: SearchMembersQuery) => {
      if (!currentFamilyId) {
        setErrorAction(t('memberSearch.errors.noFamilyId'));
        return null;
      }
      const newQuery: SearchMembersQuery = {
        ...query,
        familyId: currentFamilyId,
        page: 1,
      };
      return searchAction(newQuery, true);
    },
    [currentFamilyId, t, searchAction, setErrorAction]
  );

  const loadMore = useCallback(
    async (query: SearchMembersQuery) => {
      if (!currentFamilyId) {
        setErrorAction(t('memberSearch.errors.noFamilyId'));
        return null;
      }
      const newQuery: SearchMembersQuery = {
        ...query,
        familyId: currentFamilyId,
        page: page + 1,
      };
      return searchAction(newQuery, false);
    },
    [currentFamilyId, page, t, searchAction, setErrorAction]
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