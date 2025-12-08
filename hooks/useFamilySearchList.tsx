import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SPACING_SMALL } from '@/constants/dimensions';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { usePublicFamilyStore } from '@/stores/usePublicFamilyStore';
import { FamilyListDto, SearchPublicFamiliesQuery } from '@/types';
import { FamilyItem } from '@/components';
import { ZustandPaginatedStore } from '@/hooks/usePaginatedSearch';

interface UseFamilySearchListHook {
  useStore: () => ZustandPaginatedStore<FamilyListDto, SearchPublicFamiliesQuery>;
  renderFamilyItem: ({ item }: { item: FamilyListDto }) => React.JSX.Element;
  styles: ReturnType<typeof getStyles>;
  t: (key: string) => string;
  router: ReturnType<typeof useRouter>;
  setCurrentFamilyId: (id: string | null) => void;
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
  const router = useRouter();
  const setCurrentFamilyId = useFamilyStore((state) => state.setCurrentFamilyId);
  const styles = useMemo(() => getStyles(theme), [theme]);


  // Define useStore function for usePaginatedSearch
  const useStore = useCallback(() => {
    const { families, loading, error, hasMore, page: currentPage, fetchFamilies, reset, setError } = usePublicFamilyStore();
    return useMemo(() => ({
      items: families,
      loading,
      error,
      hasMore,
      page: currentPage,
      fetch: async (query: SearchPublicFamiliesQuery, isLoadMore: boolean) => {
        return fetchFamilies({ ...query, page: query.page || 1 }, isLoadMore);
      },
      reset,
      setError,
    }), [families, loading, error, hasMore, currentPage, fetchFamilies, reset, setError]);
  }, []);


  const renderFamilyItem = useCallback(({ item }: { item: FamilyListDto }) => (
    <FamilyItem item={item} setCurrentFamilyId={setCurrentFamilyId} />
  ), [setCurrentFamilyId]);

  return {
    useStore,
    renderFamilyItem,
    styles,
    t,
    router,
    setCurrentFamilyId,
  };
}