import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { SearchFamilyLocationsQuery, LocationType, LocationAccuracy, LocationSource } from '@/types';

interface FamilyLocationFilterProps {
  filters: SearchFamilyLocationsQuery;
  setFilters: React.Dispatch<React.SetStateAction<SearchFamilyLocationsQuery>>;
  // toggleFilterVisibility?: () => void; // Optional if not directly controlling visibility
}

const FamilyLocationFilterComponent: React.FC<FamilyLocationFilterProps> = ({ filters, setFilters }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleFilterChange = useCallback((key: keyof SearchFamilyLocationsQuery, value: any) => {
    setFilters((prevFilters) => {
      // Toggle off if already selected, or if value is falsy (e.g., undefined)
      if (prevFilters[key] === value || !value) {
        const newFilters = { ...prevFilters };
        delete newFilters[key];
        return newFilters;
      }
      return { ...prevFilters, [key]: value };
    });
  }, [setFilters]);

  const locationTypeOptions = useMemo(() => ([
    { label: t('locationType.home'), value: LocationType.Home },
    { label: t('locationType.birthplace'), value: LocationType.Birthplace },
    { label: t('locationType.deathplace'), value: LocationType.Deathplace },
    { label: t('locationType.burial'), value: LocationType.Burial },
    { label: t('locationType.other'), value: LocationType.Other },
  ]), [t]);

  const accuracyOptions = useMemo(() => ([
    { label: t('locationAccuracy.exact'), value: LocationAccuracy.Exact },
    { label: t('locationAccuracy.approximate'), value: LocationAccuracy.Approximate },
    { label: t('locationAccuracy.estimated'), value: LocationAccuracy.Estimated },
  ]), [t]);

  const sourceOptions = useMemo(() => ([
    { label: t('locationSource.userSelected'), value: LocationSource.UserSelected },
    { label: t('locationSource.geocoded'), value: LocationSource.Geocoded },
  ]), [t]);


  const styles = useMemo(() => StyleSheet.create({
    filterChipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING_SMALL,
      marginBottom: SPACING_MEDIUM,
      paddingHorizontal: SPACING_MEDIUM,
    },
    filterChip: {
      // Add any specific chip styling here
    },
  }), []);

  return (
    <View>
      <View style={styles.filterChipsContainer}>
        {locationTypeOptions.map((option) => (
          <Chip
            key={option.value}
            selected={filters.locationType === option.value}
            onPress={() => handleFilterChange('locationType', option.value)}
            style={styles.filterChip}
          >
            {option.label}
          </Chip>
        ))}
      </View>
      <View style={styles.filterChipsContainer}>
        {accuracyOptions.map((option) => (
          <Chip
            key={option.value}
            selected={filters.accuracy === option.value}
            onPress={() => handleFilterChange('accuracy', option.value)}
            style={styles.filterChip}
          >
            {option.label}
          </Chip>
        ))}
      </View>
      <View style={styles.filterChipsContainer}>
        {sourceOptions.map((option) => (
          <Chip
            key={option.value}
            selected={filters.source === option.value}
            onPress={() => handleFilterChange('source', option.value)}
            style={styles.filterChip}
          >
            {option.label}
          </Chip>
        ))}
      </View>
    </View>
  );
};

export default FamilyLocationFilterComponent;
