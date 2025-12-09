import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePublicMemberStore } from '@/stores/usePublicMemberStore';
import { MemberListDto, SearchPublicMembersQuery } from '@/types';

export function useMemberSearchPaginatedStore(currentFamilyId: string | null) {
  const { t } = useTranslation();
  const store = usePublicMemberStore();

  const mappedStore = useMemo(() => ({
    items: store.members,
    loading: store.loading,
    error: store.error,
    hasMore: store.hasMore,
    page: store.page,
    refresh: async (query: SearchPublicMembersQuery) => {
      if (!currentFamilyId) {
        store.setError(t('memberSearch.errors.noFamilyId'));
        return null;
      }
      return store.fetchMembers({ ...query, familyId: currentFamilyId, page: 1 }, true);
    },
    loadMore: async (query: SearchPublicMembersQuery) => {
      if (!currentFamilyId) {
        store.setError(t('memberSearch.errors.noFamilyId'));
        return null;
      }
      return store.fetchMembers({ ...query, familyId: currentFamilyId, page: store.page + 1 }, false);
    },
    reset: store.reset,
    setError: store.setError,
  }), [currentFamilyId, t, store.members, store.loading, store.error, store.hasMore, store.page, store.reset, store.setError]);

  return mappedStore;
}