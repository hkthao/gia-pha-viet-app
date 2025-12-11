import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { SPACING_SMALL } from '@/constants/dimensions';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { MemberListDto } from '@/types';
import MemberItem from '@/components/member/MemberItem';
import { useMemberSearchPaginatedStore } from '@/hooks/adapters/useMemberSearchPaginatedStore';

interface UseMemberSearchListHook {
  useStore: ReturnType<typeof useMemberSearchPaginatedStore>;
  renderMemberItem: ({ item }: { item: MemberListDto }) => React.JSX.Element;
  styles: ReturnType<typeof getStyles>;
  t: (key: string) => string;
}

const getStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    padding: SPACING_SMALL,
  },
});

export function useMemberSearchList(): UseMemberSearchListHook {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);
  const styles = useMemo(() => getStyles(theme), [theme]);

  const useStore = useMemberSearchPaginatedStore(currentFamilyId); // <--- separate for testing

  const renderMemberItem = useCallback(({ item }: { item: MemberListDto }) => (
    <MemberItem item={item} />
  ), []); // No longer depends on router

  return {
    useStore,
    renderMemberItem,
    styles,
    t,
  };
}