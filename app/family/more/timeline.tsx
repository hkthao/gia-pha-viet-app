import React from 'react';
import { View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useFamilyStore } from '@/stores/useFamilyStore';
import type { EventDto, SearchEventsQuery } from '@/types';
import { TimelineFilterComponent } from '@/components/event';
import { PaginatedSearchList } from '@/components/common';
import { useEventSearchList } from '@/hooks/lists/useEventSearchList';

const TimelineScreen = () => {
  const isFocused = useIsFocused();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);
  const { useStore, renderEventItem, styles: listStyles, t: listT } = useEventSearchList();

  return (
    <View style={listStyles.safeArea}> {/* Use styles from the hook */}
      <PaginatedSearchList<EventDto, SearchEventsQuery>
        useStore={() => useStore}
        searchOptions={{
          initialQuery: { searchQuery: '', familyId: '', page: 1, itemsPerPage: 10, sortBy: 'startDate', sortOrder: 'desc', type: undefined },
          externalDependencies: [currentFamilyId, isFocused],
        }}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        searchPlaceholder={listT('timeline.searchPlaceholder')} // Use t from the hook
        containerStyle={listStyles.container} // Use styles from the hook
        showFilterButton={true}
        FilterComponent={TimelineFilterComponent}
      />
    </View>
  );
};

export default TimelineScreen;
