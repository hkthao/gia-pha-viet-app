import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePublicMemberStore } from '@/stores/usePublicMemberStore';
import { MemberListDto, SearchPublicMembersQuery } from '@/types';
import { ZustandPaginatedStore } from '@/hooks/usePaginatedSearch';

export function useMemberSearchPaginatedStore(currentFamilyId: string | null): ZustandPaginatedStore<MemberListDto, SearchPublicMembersQuery> {
  const { t } = useTranslation();
  const store = usePublicMemberStore();

  const mappedStore: ZustandPaginatedStore<MemberListDto, SearchPublicMembersQuery> = useMemo(() => ({
    items: store.members,
    loading: store.loading,
    error: store.error,
    hasMore: store.hasMore,
    page: store.page,
    fetch: async (query: SearchPublicMembersQuery, isLoadMore: boolean) => {
      if (!currentFamilyId) {
        store.setError(t('memberSearch.errors.noFamilyId'));
        return null;
      }
      return store.fetchMembers({ ...query, familyId: currentFamilyId }, isLoadMore);
    },
    reset: store.reset,
    setError: store.setError,
  }), [currentFamilyId, t, store.members, store.loading, store.error, store.hasMore, store.page, store.fetchMembers, store.reset, store.setError]);

  return mappedStore;
}