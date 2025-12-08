import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import { usePublicFamilyDictStore } from '@/stores/usePublicFamilyDictStore';
import { FamilyDictDto, FamilyDictFilter } from '@/types';
import FamilyDictItem from '@/components/family-dict/FamilyDictItem';
import { ZustandPaginatedStore } from '@/hooks/usePaginatedSearch';

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
    paddingHorizontal: SPACING_MEDIUM,
  },
});

export function useFamilyDictList(): UseFamilyDictListHook {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  // Define useStore function for usePaginatedSearch
  const useStore = useCallback(() => {
    const { familyDicts, loading, error, hasMore, page, fetchFamilyDicts, reset, setError } = usePublicFamilyDictStore();
    return {
      items: familyDicts,
      loading,
      error,
      hasMore,
      page, // currentPage from store is already named 'page'
      fetch: async (filter: FamilyDictFilter, isLoadMore: boolean) => {
        // The fetchFamilyDicts function already handles page increment internally if isLoadMore is true
        // It also accepts page and itemsPerPage directly
        return fetchFamilyDicts(filter, isLoadMore ? page + 1 : 1, 10, !isLoadMore);
      },
      reset,
      setError,
    } as ZustandPaginatedStore<FamilyDictDto, FamilyDictFilter>;
  }, [usePublicFamilyDictStore]);

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