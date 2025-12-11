import React from 'react';
import { View } from 'react-native';
import { PaginatedSearchListV2 } from '@/components/common/PaginatedSearchListV2';
import { TimelineFilterComponent } from '@/components/event';
import { useTimelineSearch } from '@/hooks/lists/useTimelineSearch'; // Import the new custom hook
import type { EventDto, SearchEventsQuery } from '@/types';
import DefaultEmptyList from '@/components/common/DefaultEmptyList'; // Import DefaultEmptyList

const TimelineScreen = () => {
  const {
    isFocused,
    currentFamilyId,
    t,
    styles,
    eventSearchQueryFn,
    getEventSearchQueryKey,
    initialQuery,
    renderEventItem,
  } = useTimelineSearch();

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
