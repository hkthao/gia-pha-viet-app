import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { PaginatedSearchListV2 } from '@/components/common/PaginatedSearchListV2'; // Use V2
import { SPACING_SMALL } from '@/constants/dimensions';
import { FamilyListDto, SearchFamiliesQuery, PaginatedList } from '@/types';
import { familyService } from '@/services'; // Import familyService
import { useRouter } from 'expo-router'; // Import useRouter
import type { QueryKey } from '@tanstack/react-query'; // Import QueryKey
import { FamilyItem } from '@/components'; // Import FamilyItem
import DefaultEmptyList from '@/components/common/DefaultEmptyList'; // Import DefaultEmptyList for PaginatedSearchListV2
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { useAuth } from '@/hooks/auth/useAuth'; // Import useAuth

// Extracted styles and render item logic, previously from useFamilySearchList
const getStyles = () => StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING_SMALL,
  },
});

export default function SearchScreen() {
  const router = useRouter(); // Initialize useRouter
  const styles = useMemo(() => getStyles(), []);
  const { t } = useTranslation(); // Initialize useTranslation
  const { isLoggedIn } = useAuth(); // Get isLoggedIn status


  // Define the query function for fetching family data
  const familySearchQueryFn = useCallback(
    async ({ pageParam = 1, filters }: { pageParam?: number; queryKey: QueryKey; filters: SearchFamiliesQuery }): Promise<PaginatedList<FamilyListDto>> => {
      const result = await familyService.search({ ...filters, page: pageParam });
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(result.error?.message || 'Failed to fetch families');
    },
    []
  );

  // Define the query key generation function
  const getFamilySearchQueryKey = useCallback((filters: SearchFamiliesQuery): QueryKey => {
    // Ensure the query key changes when filters change to trigger new fetches
    return ['families', 'search', filters];
  }, []);

  const initialQuery: SearchFamiliesQuery = useMemo(() => ({ page: 1, itemsPerPage: 10, searchQuery: '' }), []);

  const renderFamilyItem = useCallback(
    ({ item }: { item: FamilyListDto }) => {
      return <FamilyItem item={item} />;
    },
    []
  );



  return (
    <View style={styles.safeArea}>
      <Appbar.Header>
        <Appbar.Content title={t('search.title')} />
        {isLoggedIn && (
          <Appbar.Action icon="plus" onPress={() => router.push('/family/create')} />
        )}
      </Appbar.Header>
      <PaginatedSearchListV2<FamilyListDto, SearchFamiliesQuery>
        queryKey={getFamilySearchQueryKey}
        queryFn={familySearchQueryFn}
        initialFilters={initialQuery}
        renderItem={renderFamilyItem}
        keyExtractor={(item) => item.id}
        searchPlaceholder={t('search.placeholder')}
        containerStyle={styles.container}
        // No explicit error prop for V2, it's handled internally
        ListEmptyComponent={<DefaultEmptyList styles={styles} t={t} />} // Pass DefaultEmptyList for V2
      />
    </View>
  );
}