import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useCurrentFamilyId } from '@/hooks/family/useCurrentFamilyId';
import type { EventDto, SearchEventsQuery, PaginatedList } from '@/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { eventService } from '@/services';
import type { QueryKey } from '@tanstack/react-query';
import { TimelineListItem } from '@/components/event';
import { SPACING_SMALL } from '@/constants/dimensions';

// Styles for the TimelineScreen and PaginatedSearchListV2
const getStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING_SMALL,
  },
});

export function useTimelineSearch() {
  const isFocused = useIsFocused();
  const currentFamilyId = useCurrentFamilyId();
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  // Define the query function for fetching event data
  const eventSearchQueryFn = useCallback(
    async ({ pageParam = 1, filters }: { pageParam?: number; queryKey: QueryKey; filters: SearchEventsQuery }): Promise<PaginatedList<EventDto>> => {
      if (!currentFamilyId) {
        throw new Error(t('timeline.familyIdNotFound'));
      }
      const result = await eventService.search({ ...filters, familyId: currentFamilyId, page: pageParam });
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(result.error?.message || t('timeline.failedToLoadEvents'));
    },
    [currentFamilyId, t]
  );

  // Define the query key generation function
  const getEventSearchQueryKey = useCallback((filters: SearchEventsQuery): QueryKey => {
    return ['events', 'timeline', currentFamilyId, filters];
  }, [currentFamilyId]);

  const initialQuery: SearchEventsQuery = useMemo(() => ({
    searchQuery: '',
    familyId: '', // Will be overridden by currentFamilyId in queryFn
    page: 1,
    itemsPerPage: 10,
    sortBy: 'startDate',
    sortOrder: 'desc',
    type: undefined
  }), []);

  const renderEventItem = useCallback(({ item, index }: { item: EventDto, index: number }): React.JSX.Element => {
    return React.createElement(TimelineListItem, {
      item: item,
      index: index,
      isFirst: index === 0
    });
  }, []);

  return {
    isFocused,
    currentFamilyId,
    t,
    theme,
    styles,
    eventSearchQueryFn,
    getEventSearchQueryKey,
    initialQuery,
    renderEventItem,
  };
}
