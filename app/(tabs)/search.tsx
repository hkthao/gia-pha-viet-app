import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { PaginatedSearchList } from '@/components/common';
import { FamilyListDto, SearchPublicFamiliesQuery } from '@/types';
import { useFamilySearchList } from '@/hooks/useFamilySearchList';
import { useInfiniteUpdateDetector } from '@/hooks/useInfiniteUpdateDetector'; // Import the hook

export default function SearchScreen() {
  const { useStore, renderFamilyItem, styles, t } = useFamilySearchList();

  // useStore is already the object containing the state and actions
  const { items, loading, error, hasMore, page } = useStore;

  // Call the detector hook with specific state values as dependencies
  useInfiniteUpdateDetector({
    name: 'SearchScreen',
    dependencies: [
      items,
      loading,
      error,
      hasMore,
      page,
      renderFamilyItem,
      styles,
      t
    ],
  });

  const initialQuery = useMemo(() => ({ page: 1, itemsPerPage: 10, searchTerm: '' }), []);

  return (
    <View style={styles.safeArea}>
      <Appbar.Header>
        <Appbar.Content title={t('search.title')} />
      </Appbar.Header>
      <PaginatedSearchList<FamilyListDto, SearchPublicFamiliesQuery>
        useStore={() => useStore}
        searchOptions={{
          initialQuery: initialQuery,
        }}
        renderItem={renderFamilyItem}
        keyExtractor={(item) => item.id}
        searchPlaceholder={t('search.placeholder')}
        containerStyle={styles.container}
      // Additional props can be passed here as needed
      />
    </View>
  );
}