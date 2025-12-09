import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePublicMemberStore } from '@/stores/usePublicMemberStore';
import { MemberListDto, SearchPublicMembersQuery } from '@/types';

export function useMemberSearchPaginatedStore(currentFamilyId: string | null) {
  const { t } = useTranslation();

  const items = usePublicMemberStore((state) => state.items);
  const loading = usePublicMemberStore((state) => state.loading);
  const error = usePublicMemberStore((state) => state.error);
  const hasMore = usePublicMemberStore((state) => state.hasMore);
  const page = usePublicMemberStore((state) => state.page);

  // Extract stable actions directly
  const searchAction = usePublicMemberStore((state) => state.search);
  const resetAction = usePublicMemberStore((state) => state.reset);
  const setErrorAction = usePublicMemberStore((state) => state.setError);

  // Memoize the refresh and loadMore functions using useCallback to ensure their stability
  const refresh = useCallback(
    async (query: SearchPublicMembersQuery) => {
      if (!currentFamilyId) {
        setErrorAction(t('memberSearch.errors.noFamilyId'));
        return null;
      }
      const newQuery: SearchPublicMembersQuery = {
        ...query,
        familyId: currentFamilyId,
        page: 1,
      };
      return searchAction(newQuery, true);
    },
    [currentFamilyId, t, searchAction, setErrorAction]
  );

  const loadMore = useCallback(
    async (query: SearchPublicMembersQuery) => {
      if (!currentFamilyId) {
        setErrorAction(t('memberSearch.errors.noFamilyId'));
        return null;
      }
      const newQuery: SearchPublicMembersQuery = {
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