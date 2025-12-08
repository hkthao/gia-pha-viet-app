import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { SPACING_SMALL } from '@/constants/dimensions';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { usePublicMemberStore } from '@/stores/usePublicMemberStore';
import { MemberListDto, SearchPublicMembersQuery } from '@/types';
import { ZustandPaginatedStore } from '@/hooks/usePaginatedSearch';
import { MemberItem } from '@/components';

interface UseMemberSearchListHook {
  useStore: ZustandPaginatedStore<MemberListDto, SearchPublicMembersQuery>;
  renderMemberItem: ({ item }: { item: MemberListDto }) => React.JSX.Element;
  styles: ReturnType<typeof getStyles>;
  t: (key: string) => string;
  router: ReturnType<typeof useRouter>;
  currentFamilyId: string | null;
}

const getStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING_SMALL,
  },
});

export function useMemberSearchList(): UseMemberSearchListHook {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);
  const styles = useMemo(() => getStyles(theme), [theme]);

  const store = usePublicMemberStore(); // <--- separate for testing

  const mappedStore: ZustandPaginatedStore<MemberListDto, SearchPublicMembersQuery> =
    useMemo(() => ({
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

  const renderMemberItem = useCallback(({ item }: { item: MemberListDto }) => (
    <MemberItem item={item} onSelect={(id) => router.push(`/member/${id}`)} />
  ), [router]);

  return {
    useStore: mappedStore,
    renderMemberItem,
    styles,
    t,
    router,
    currentFamilyId,
  };
}