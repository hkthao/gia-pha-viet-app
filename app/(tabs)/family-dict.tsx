import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper'; // Import useTheme
import { PaginatedSearchListV2 } from '@/components/common/PaginatedSearchListV2'; // Use V2
import { FamilyDictDto, FamilyDictSearchQuery, PaginatedList } from '@/types';
// import { useFamilyDictList } from '@/hooks/lists/useFamilyDictList'; // Removed
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { familyDictService } from '@/services'; // Import familyDictService
import type { QueryKey } from '@tanstack/react-query'; // Import QueryKey
import FamilyDictItem from '@/components/family-dict/FamilyDictItem'; // Import FamilyDictItem
import DefaultEmptyList from '@/components/common/DefaultEmptyList'; // Import DefaultEmptyList
import { SPACING_SMALL } from '@/constants/dimensions'; // Import SPACING_SMALL

const getStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING_SMALL,
  },
});

export default function FamilyDictScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  // Define the query function for fetching family dictionary data
  const familyDictQueryFn = useCallback(
    async ({ pageParam = 1, filters }: { pageParam?: number; queryKey: QueryKey; filters: FamilyDictSearchQuery }): Promise<PaginatedList<FamilyDictDto>> => {
      const result = await familyDictService.search({ ...filters, page: pageParam });
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(result.error?.message || t('familyDict.search.no_results'));
    },
    [t]
  );

  // Define the query key generation function
  const getFamilyDictQueryKey = useCallback((filters: FamilyDictSearchQuery): QueryKey => {
    return ['familyDicts', 'search', filters];
  }, []);

  const initialQuery: FamilyDictSearchQuery = useMemo(() => ({ searchQuery: '', sortBy: 'name', sortOrder: 'asc' }), []);

  const renderFamilyDictItem = useCallback(({ item }: { item: FamilyDictDto }) => (
    <FamilyDictItem item={item} />
  ), []);

  return (
    <View style={styles.safeArea}>
      <Appbar.Header>
        <Appbar.Content title={t('familyDict.list.title')} />
      </Appbar.Header>
      <PaginatedSearchListV2<FamilyDictDto, FamilyDictSearchQuery>
        queryKey={getFamilyDictQueryKey}
        queryFn={familyDictQueryFn}
        initialFilters={initialQuery}
        renderItem={renderFamilyDictItem}
        keyExtractor={(item) => item.id}
        searchPlaceholder={t('familyDict.search.search')}
        containerStyle={styles.container}
        ListEmptyComponent={<DefaultEmptyList styles={styles} t={t} />}
      />
    </View>
  );
}
