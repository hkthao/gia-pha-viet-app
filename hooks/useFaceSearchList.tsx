import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { SPACING_SMALL } from '@/constants/dimensions';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { DetectedFaceDto, SearchFacesQuery } from '@/types';
import { useFaceSearchPaginatedStore } from '@/hooks/adapters/useFaceSearchPaginatedStore';
import FaceItem from '@/components/face/FaceItem';

interface UseFaceSearchListHook {
  useStore: ReturnType<typeof useFaceSearchPaginatedStore>;
  renderFaceItem: ({ item }: { item: DetectedFaceDto }) => React.JSX.Element;
  styles: ReturnType<typeof getStyles>;
  t: (key: string) => string;
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

export function useFaceSearchList(): UseFaceSearchListHook {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);
  const styles = useMemo(() => getStyles(theme), [theme]);

  const useStore = useFaceSearchPaginatedStore(currentFamilyId);

  const renderFaceItem = useCallback(({ item }: { item: DetectedFaceDto }) => (
    <FaceItem item={item} />
  ), []);

  return {
    useStore,
    renderFaceItem,
    styles,
    t,
  };
}
