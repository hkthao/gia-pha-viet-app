import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, FAB } from 'react-native-paper';
import { PaginatedSearchList } from '@/components/common';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import { FamilyListDto, SearchFamiliesQuery } from '@/types';
import { useFamilySearchList } from '@/hooks/lists/useFamilySearchList';
import { useInfiniteUpdateDetector } from '@/hooks/common/useInfiniteUpdateDetector';
import { useRouter } from 'expo-router'; // Import useRouter

export default function SearchScreen() {
  const { useStore, renderFamilyItem, styles, t } = useFamilySearchList();
  const router = useRouter(); // Initialize useRouter

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

  const fabStyles = useMemo(() => StyleSheet.create({
    fab: {
      position: 'absolute',
      margin: SPACING_MEDIUM,
      right: 0,
      bottom: 0,
    },
  }), []);

  return (
    <View style={styles.safeArea}>
      <Appbar.Header>
        <Appbar.Content title={t('search.title')} />
      </Appbar.Header>
      <PaginatedSearchList<FamilyListDto, SearchFamiliesQuery>
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
      <FAB
        style={fabStyles.fab}
        icon="plus"
        onPress={() => router.push('/family/create')} // Placeholder action
      />
    </View>
  );
}