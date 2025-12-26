import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { PaginatedSearchListV2 } from '@/components/common/PaginatedSearchListV2';
import { SPACING_SMALL } from '@/constants/dimensions';
import { FamilyListDto, SearchFamiliesQuery, PaginatedList } from '@/types';
import { familyService } from '@/services'; // Import familyService
import type { QueryKey } from '@tanstack/react-query';
import { FamilyItem } from '@/components';
import DefaultEmptyList from '@/components/common/DefaultEmptyList';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/auth/useAuth';

const getStyles = () => StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING_SMALL,
  },
});

export default function CommunityFamilySearchScreen() {
  const styles = useMemo(() => getStyles(), []);
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth(); // Ensure isLoggedIn is available

  // Define the query function for fetching public family data
  const publicFamilySearchQueryFn = useCallback(
    async ({ pageParam = 1, filters }: { pageParam?: number; queryKey: QueryKey; filters: SearchFamiliesQuery }): Promise<PaginatedList<FamilyListDto>> => {

      console.log('Fetching public family data with filters:', filters, 'page:', pageParam);
      const result = await familyService.publicSearch({ ...filters, page: pageParam }); // Assuming publicSearch exists
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(result.error?.message || 'Failed to fetch public families');
    },
    []
  );

  // Define the query key generation function for public search
  const getPublicFamilySearchQueryKey = useCallback((filters: SearchFamiliesQuery): QueryKey => {
    return ['families', 'public-search', filters];
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
        <Appbar.Content title={t('tab.communitySearch')} />
      </Appbar.Header>
      <PaginatedSearchListV2<FamilyListDto, SearchFamiliesQuery>
        queryKey={getPublicFamilySearchQueryKey}
        queryFn={publicFamilySearchQueryFn}
        initialFilters={initialQuery}
        renderItem={renderFamilyItem}
        keyExtractor={(item) => item.id}
        searchPlaceholder={t('search.placeholder')}
        containerStyle={styles.container}
        ListEmptyComponent={<DefaultEmptyList styles={styles} t={t} />}
      />
    </View>
  );
}
