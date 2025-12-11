import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { Gender, MemberListDto, SearchMembersQuery } from '@/types';
import { PaginatedSearchList } from '@/components/common';
import { useMemberSearchList } from '@/hooks/lists/useMemberSearchList';
import { useFamilyStore } from '@/stores/useFamilyStore'; // NEW IMPORT


interface MemberFilterProps {
  filters: SearchMembersQuery;
  setFilters: React.Dispatch<React.SetStateAction<SearchMembersQuery>>;
  toggleFilterVisibility?: () => void;
}

const MemberFilterComponent: React.FC<MemberFilterProps> = ({ filters, setFilters }) => {
  const { t } = useTranslation();

  const handleFilterChange = useCallback((key: keyof SearchMembersQuery, value: any) => {
    setFilters((prevFilters) => {
      // Toggle off if already selected
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
      <Chip
        selected={filters.gender === Gender.Male}
        onPress={() => handleFilterChange('gender', Gender.Male)}
        style={styles.filterChip}
      >
        {t('memberSearch.filter.gender.male')}
      </Chip>
      <Chip
        selected={filters.gender === Gender.Female}
        onPress={() => handleFilterChange('gender', Gender.Female)}
        style={styles.filterChip}
      >
        {t('memberSearch.filter.gender.female')}
      </Chip>
      <Chip
        selected={filters.gender === Gender.Other}
        onPress={() => handleFilterChange('gender', Gender.Other)}
        style={styles.filterChip}
      >
        {t('memberSearch.filter.gender.other')}
      </Chip>
      <Chip
        selected={filters.isRoot === true}
        onPress={() => handleFilterChange('isRoot', true)}
        style={styles.filterChip}
      >
        {t('memberSearch.filter.isRootMember')}
      </Chip>
    </View>
  );
};


export default function FamilyMembersScreen() {
  const { useStore, renderMemberItem, styles, t } = useMemberSearchList();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId); // Get currentFamilyId directly

  return (
    <View style={styles.safeArea}>
      <PaginatedSearchList<MemberListDto, SearchMembersQuery>
        useStore={() => useStore}
        searchOptions={{
          initialQuery: { familyId: '', page: 1, itemsPerPage: 10, searchQuery: '', gender: undefined, isRoot: undefined },
          externalDependencies: [currentFamilyId],
        }}
        renderItem={renderMemberItem}
        keyExtractor={(item) => item.id}
        searchPlaceholder={t('memberSearch.placeholder')}
        containerStyle={styles.container}
        showFilterButton={true}
        FilterComponent={MemberFilterComponent}
      />
    </View>
  );
}
