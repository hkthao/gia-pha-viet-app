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
  const setCurrentFamilyId = useFamilyStore((s) => s.setCurrentFamilyId);

  const store = usePublicFamilyStore(); // <--- separate for testing

  const styles = useMemo(() => getStyles(theme), [theme]);

  const mappedStore: ZustandPaginatedStore<FamilyListDto, SearchPublicFamiliesQuery> =
    useMemo(() => ({
      items: store.families,
      loading: store.loading,
      error: store.error,
      hasMore: store.hasMore,
      page: store.page,
      fetch: async (query, isLoadMore) =>
        store.fetchFamilies({ ...query, page: query.page || 1 }, isLoadMore),
      reset: store.reset,
      setError: store.setError,
    }), [
      store.families,
      store.loading,
      store.error,
      store.hasMore,
      store.page,
      store.fetchFamilies,
      store.reset,
      store.setError
    ]);

  const renderFamilyItem = useCallback(
    ({ item }: { item: FamilyListDto }) => (
      <FamilyItem item={item} onSelect={setCurrentFamilyId} />
    ),
    [setCurrentFamilyId]
  );

  return {
    useStore: () => mappedStore,
    renderFamilyItem,
    styles,
    t,
    router,
    setCurrentFamilyId,
  };
}