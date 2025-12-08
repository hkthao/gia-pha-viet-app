import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SPACING_SMALL } from '@/constants/dimensions';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { FamilyListDto, SearchPublicFamiliesQuery } from '@/types';
import { FamilyItem } from '@/components';
import { ZustandPaginatedStore } from '@/hooks/usePaginatedSearch';
import { useFamilySearchPaginatedStore } from '@/hooks/adapters/useFamilySearchPaginatedStore'; // New import

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

  const useStore = useFamilySearchPaginatedStore; // <-- Now it's the hook itself

  const styles = useMemo(() => getStyles(theme), [theme]);

  const renderFamilyItem = useCallback(
    ({ item }: { item: FamilyListDto }) => {
      console.log('Rendering FamilyItem for:', item.name); // Add this log
      return <FamilyItem item={item} onSelect={setCurrentFamilyId} />;
    },
    [setCurrentFamilyId]
  );

  return {
    useStore,
    renderFamilyItem,
    styles,
    t,
    router,
    setCurrentFamilyId,
  };
}