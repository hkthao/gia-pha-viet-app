import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { EventType, SearchEventsQuery } from '@/types';

interface TimelineFilterProps {
  filters: SearchEventsQuery;
  setFilters: React.Dispatch<React.SetStateAction<SearchEventsQuery>>;
}

const TimelineFilterComponent: React.FC<TimelineFilterProps> = ({ filters, setFilters }) => {
  const { t } = useTranslation();

  const handleFilterChange = useCallback((key: keyof SearchEventsQuery, value: any) => {
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
      marginRight: SPACING_SMALL,
    },
  }), []);

  return (
    <View style={styles.filterChipsContainer}>
      <Chip
        selected={filters.type === EventType.Birth}
        onPress={() => handleFilterChange('type', EventType.Birth)}
        style={styles.filterChip}
      >
        {t('eventType.birth')}
      </Chip>
      <Chip
        selected={filters.type === EventType.Marriage}
        onPress={() => handleFilterChange('type', EventType.Marriage)}
        style={styles.filterChip}
      >
        {t('eventType.marriage')}
      </Chip>
      <Chip
        selected={filters.type === EventType.Death}
        onPress={() => handleFilterChange('type', EventType.Death)}
        style={styles.filterChip}
      >
        {t('eventType.death')}
      </Chip>
      <Chip
        selected={filters.type === EventType.Anniversary}
        onPress={() => handleFilterChange('type', EventType.Anniversary)}
        style={styles.filterChip}
      >
        {t('eventType.anniversary')}
      </Chip>
      <Chip
        selected={filters.type === EventType.Other}
        onPress={() => handleFilterChange('type', EventType.Other)}
        style={styles.filterChip}
      >
        {t('eventType.other')}
      </Chip>
    </View>
  );
};

export default TimelineFilterComponent;
