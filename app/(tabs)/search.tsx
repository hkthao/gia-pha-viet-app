import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { PaginatedSearchList } from '@/components/common';
import { FamilyListDto, SearchPublicFamiliesQuery } from '@/types';
import { useFamilySearchList } from '@/hooks/useFamilySearchList';
import { useInfiniteUpdateDetector } from '@/hooks/useInfiniteUpdateDetector'; // Import the hook

export default function SearchScreen() {
  const { useStore, renderFamilyItem, styles, t } = useFamilySearchList();

  // Call the store hook to get the state and actions
  const { items, loading, error, hasMore, page } = useStore();

  // Call the detector hook with specific state values as dependencies
  useInfiniteUpdateDetector({
    name: 'SearchScreen',
    dependencies: [
      { name: 'items', value: items },
      { name: 'loading', value: loading },
      { name: 'error', value: error },
      { name: 'hasMore', value: hasMore },
      { name: 'page', value: page },
      { name: 'renderFamilyItem', value: renderFamilyItem },
      { name: 'styles', value: styles },
      { name: 't', value: t }
    ],
  });

  const initialQuery = useMemo(() => ({ page: 1, itemsPerPage: 10, searchQuery: '' }), []);

  return (
    <View style={styles.safeArea}>
      <Appbar.Header>
        <Appbar.Content title={t('search.title')} />
      </Appbar.Header>
      <PaginatedSearchList<FamilyListDto, SearchPublicFamiliesQuery>
        useStore={useStore} // Pass the useStore hook directly
        searchOptions={{
          initialQuery: initialQuery,
        }}
        renderItem={renderFamilyItem}
        keyExtractor={(item) => item.id}
        searchPlaceholder={t('search.placeholder')}
        containerStyle={styles.container}
        error={error} // Pass the error state
      />
    </View>
  );
}