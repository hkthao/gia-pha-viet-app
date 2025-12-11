import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useFamilyStore } from '@/stores/useFamilyStore';
import type { EventDto, SearchEventsQuery, PaginatedList } from '@/types';
import { TimelineFilterComponent } from '@/components/event';
import { PaginatedSearchListV2 } from '@/components/common/PaginatedSearchListV2'; // Use V2
// import { useEventSearchList } from '@/hooks/lists/useEventSearchList'; // Removed
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { useTheme } from 'react-native-paper'; // Import useTheme
import { eventService } from '@/services'; // Import eventService
import type { QueryKey } from '@tanstack/react-query'; // Import QueryKey
import { TimelineListItem } from '@/components/event'; // Import TimelineListItem
import DefaultEmptyList from '@/components/common/DefaultEmptyList'; // Import DefaultEmptyList
import { SPACING_SMALL } from '@/constants/dimensions'; // Import SPACING_SMALL

const getStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING_SMALL,
  },
});

const TimelineScreen = () => {
  const isFocused = useIsFocused();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);
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

  const renderEventItem = useCallback(({ item, index }: { item: EventDto, index: number }) => (
    <TimelineListItem
      item={item}
      index={index}
      isFirst={index === 0}
    />
  ), []);

  return (
    <View style={styles.safeArea}>
      <PaginatedSearchListV2<EventDto, SearchEventsQuery>
        queryKey={getEventSearchQueryKey}
        queryFn={eventSearchQueryFn}
        initialFilters={initialQuery}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        searchPlaceholder={t('timeline.searchPlaceholder')}
        containerStyle={styles.container}
        showFilterButton={true}
        FilterComponent={TimelineFilterComponent}
        ListEmptyComponent={<DefaultEmptyList styles={styles} t={t} />}
        externalDependencies={[currentFamilyId, isFocused]}
      />
    </View>
  );
};

export default TimelineScreen;
