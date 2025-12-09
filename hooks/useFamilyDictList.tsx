import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { SPACING_SMALL } from '@/constants/dimensions';
import { FamilyDictDto, FamilyDictFilter } from '@/types';
import FamilyDictItem from '@/components/family-dict/FamilyDictItem';
import { ZustandPaginatedStore } from '@/hooks/usePaginatedSearch';
import { useFamilyDictPaginatedStore } from '@/hooks/adapters/useFamilyDictPaginatedStore';

interface UseFamilyDictListHook {
  useStore: () => ZustandPaginatedStore<FamilyDictDto, FamilyDictFilter>;
  renderFamilyDictItem: ({ item }: { item: FamilyDictDto }) => React.JSX.Element;
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

export function useFamilyDictList(): UseFamilyDictListHook {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const useStore = useCallback(() => useFamilyDictPaginatedStore(), []);

  const renderFamilyDictItem = useCallback(({ item }: { item: FamilyDictDto }) => (
    <FamilyDictItem item={item} />
  ), []);

  return {
    useStore,
    renderFamilyDictItem,
    styles,
    t,
  };
}