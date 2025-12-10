import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { DetectedFaceDto, SearchFacesQuery } from '@/types';
import { PaginatedSearchList } from '@/components/common';
import { useFaceSearchList } from '@/hooks/useFaceSearchList';
import { useFamilyStore } from '@/stores/useFamilyStore';

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


export default function FamilyFaceDataScreen() {
  const { useStore, renderFaceItem, styles, t } = useFaceSearchList();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);

  return (
    <View style={styles.safeArea}>
      <PaginatedSearchList<DetectedFaceDto, SearchFacesQuery>
        useStore={() => useStore}
        searchOptions={{
          initialQuery: { familyId: '', page: 1, itemsPerPage: 10, searchQuery: '', minConfidence: undefined, maxConfidence: undefined },
          externalDependencies: [currentFamilyId],
        }}
        renderItem={renderFaceItem}
        keyExtractor={(item) => item.id}
        searchPlaceholder={t('faceSearch.placeholder')} // Assuming this key exists
        containerStyle={styles.container}
        showFilterButton={true} // Set to true to use FilterComponent
        FilterComponent={FaceFilterComponent}
      />
    </View>
  );
}
