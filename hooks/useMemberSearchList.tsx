import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { SPACING_SMALL } from '@/constants/dimensions';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { MemberListDto, SearchPublicMembersQuery } from '@/types';
import { MemberItem } from '@/components';
import { useMemberSearchPaginatedStore } from '@/hooks/adapters/useMemberSearchPaginatedStore';

interface UseMemberSearchListHook {
  useStore: ReturnType<typeof useMemberSearchPaginatedStore>;
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

  const useStore = useMemberSearchPaginatedStore(currentFamilyId); // <--- separate for testing

  const renderMemberItem = useCallback(({ item }: { item: MemberListDto }) => (
    <MemberItem item={item} onSelect={(id) => router.push(`/member/${id}`)} />
  ), [router]);

  return {
    useStore,
    renderMemberItem,
    styles,
    t,
    router,
    currentFamilyId,
  };
}