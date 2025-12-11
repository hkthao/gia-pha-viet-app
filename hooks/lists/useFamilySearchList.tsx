import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SPACING_SMALL } from '@/constants/dimensions';
import { FamilyListDto } from '@/types';
import { FamilyItem } from '@/components';
import { useFamilySearchPaginatedStore } from '@/hooks/adapters/useFamilySearchPaginatedStore';

interface UseFamilySearchListHook {
  useStore: () => ReturnType<typeof useFamilySearchPaginatedStore>;
  renderFamilyItem: ({ item }: { item: FamilyListDto }) => React.JSX.Element;
  styles: ReturnType<typeof getStyles>;
  t: (key: string) => string;
}

const getStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING_SMALL,
  },
});

export function useFamilySearchList(): UseFamilySearchListHook {
  const { t } = useTranslation();
  const theme = useTheme();

  const useStore = useCallback(() => useFamilySearchPaginatedStore(), []);

  const styles = useMemo(() => getStyles(theme), [theme]);

  const renderFamilyItem = useCallback(
    ({ item }: { item: FamilyListDto }) => {
      return <FamilyItem item={item} />; // FamilyItem now handles its own onSelect
    },
    [] // Dependencies removed as setCurrentFamilyId is no longer here
  );

  return {
    useStore,
    renderFamilyItem,
    styles,
    t,
  };
}