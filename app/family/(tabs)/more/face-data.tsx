import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, useTheme } from 'react-native-paper'; // Import useTheme
import { useTranslation } from 'react-i18next';

import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { DetectedFaceDto, SearchFacesQuery, PaginatedList } from '@/types';
import { PaginatedSearchListV2 } from '@/components/common/PaginatedSearchListV2'; // Use V2
// import { useFaceSearchList } from '@/hooks/lists/useFaceSearchList'; // Removed
import { useFamilyStore } from '@/stores/useFamilyStore';
import { faceService } from '@/services'; // Import faceService
import type { QueryKey } from '@tanstack/react-query'; // Import QueryKey
import FaceItem from '@/components/face/FaceItem'; // Import FaceItem
import DefaultEmptyList from '@/components/common/DefaultEmptyList'; // Import DefaultEmptyList

// Optional: FaceFilterComponent if needed
interface FaceFilterProps {
  filters: SearchFacesQuery;
  setFilters: React.Dispatch<React.SetStateAction<SearchFacesQuery>>;
  toggleFilterVisibility?: () => void;
}

const FaceFilterComponent: React.FC<FaceFilterProps> = ({ filters, setFilters }) => {
  const { t } = useTranslation();

  const handleFilterChange = useCallback((key: keyof SearchFacesQuery, value: any) => {
    setFilters((prevFilters) => {
      if (prevFilters[key] === value) {
        const newFilters = { ...prevFilters };
        delete newFilters[key];
        return newFilters;
      }
      return { ...prevFilters, [key]: value };
    });
  }, [setFilters]);

  const styles = useMemo(() => StyleSheet.create({
    filterChipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING_SMALL,
      marginBottom: SPACING_MEDIUM,
    },
    filterChip: {
      // Add any specific chip styling here
    },
  }), []);

  return (
    <View style={styles.filterChipsContainer}>
      {/* Example: Add chips for minConfidence, maxConfidence if applicable */}
      <Chip
        selected={filters.minConfidence === 0.8}
        onPress={() => handleFilterChange('minConfidence', 0.8)}
        style={styles.filterChip}
      >
        {t('faceSearch.filter.minConfidence')}
      </Chip>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING_SMALL,
  },
});

export default function FamilyFaceDataScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);

  // Define the query function for fetching face data
  const faceSearchQueryFn = useCallback(
    async ({ pageParam = 1, filters, queryKey: reactQueryKey }: { pageParam?: number; queryKey: QueryKey; filters: SearchFacesQuery }): Promise<PaginatedList<DetectedFaceDto>> => {
      if (!currentFamilyId) {
        throw new Error(t('faceSearch.noFamilyIdSelected'));
      }
      const result = await faceService.search({ ...filters, familyId: currentFamilyId, page: pageParam });
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(result.error?.message || t('faceSearch.detectionFailed'));
    },
    [currentFamilyId, t]
  );

  // Define the query key generation function
  const getFaceSearchQueryKey = useCallback((filters: SearchFacesQuery): QueryKey => {
    return ['faces', 'search', currentFamilyId, filters];
  }, [currentFamilyId]);

  const initialQuery: SearchFacesQuery = useMemo(() => ({
    searchQuery: '',
    minConfidence: undefined,
    maxConfidence: undefined,
    familyId: currentFamilyId || '',
  }), [currentFamilyId]);

  const renderFaceItem = useCallback(({ item }: { item: DetectedFaceDto }) => (
    <FaceItem item={item} />
  ), []);

  return (
    <View style={styles.safeArea}>
      <PaginatedSearchListV2<DetectedFaceDto, SearchFacesQuery>
        queryKey={getFaceSearchQueryKey}
        queryFn={faceSearchQueryFn}
        initialFilters={initialQuery}
        renderItem={renderFaceItem}
        keyExtractor={(item) => item.id}
        searchPlaceholder={t('faceSearch.placeholder')}
        containerStyle={styles.container}
        showFilterButton={true}
        FilterComponent={FaceFilterComponent}
        ListEmptyComponent={<DefaultEmptyList styles={styles} t={t} />}
        externalDependencies={[currentFamilyId]}
      />
    </View>
  );
}
