import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { SPACING_SMALL } from '@/constants/dimensions';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { EventDto } from '@/types';
import { TimelineListItem } from '@/components/event';
import { useEventSearchPaginatedStore } from '@/hooks/adapters/useEventSearchPaginatedStore';

interface UseEventSearchListHook {
  useStore: ReturnType<typeof useEventSearchPaginatedStore>;
  renderEventItem: ({ item, index }: { item: EventDto, index: number }) => React.JSX.Element;
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

export function useEventSearchList(): UseEventSearchListHook {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);
  const styles = useMemo(() => getStyles(theme), [theme]);

  const useStore = useEventSearchPaginatedStore(currentFamilyId);

  const renderEventItem = useCallback(({ item, index }: { item: EventDto, index: number }) => (
    <TimelineListItem
      item={item}
      index={index}
      isFirst={index === 0}
      // isLast is calculated dynamically in PaginatedSearchList based on total items
    />
  ), []); 

  return {
    useStore,
    renderEventItem,
    styles,
    t,
  };
}