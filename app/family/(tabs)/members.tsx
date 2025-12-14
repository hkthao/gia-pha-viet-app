import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, useTheme, FAB, Appbar } from 'react-native-paper'; // Import FAB, Appbar
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router'; // Import useRouter

import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { Gender, MemberListDto, SearchMembersQuery, PaginatedList } from '@/types';
import { PaginatedSearchListV2 } from '@/components/common/PaginatedSearchListV2'; // Use V2
import { useFamilyStore } from '@/stores/useFamilyStore';
import { memberService } from '@/services'; // Import memberService
import type { QueryKey } from '@tanstack/react-query'; // Import QueryKey
import MemberItem from '@/components/member/MemberItem'; // Import MemberItem
import DefaultEmptyList from '@/components/common/DefaultEmptyList'; // Import DefaultEmptyList
import { usePermissionCheck } from '@/hooks/permissions/usePermissionCheck'; // Import usePermissionCheck


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

const getStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    padding: SPACING_SMALL,
  },
  fab: {
    position: 'absolute',
    margin: SPACING_MEDIUM,
    right: 0,
    bottom: 0,
  },
});

export default function FamilyMembersScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const router = useRouter(); // Initialize useRouter
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);
  const { canManageFamily } = usePermissionCheck(currentFamilyId ?? undefined); // Check permission

  // Define the query function for fetching member data
  const memberSearchQueryFn = useCallback(
    async ({ pageParam = 1, filters, queryKey: reactQueryKey }: { pageParam?: number; queryKey: QueryKey; filters: SearchMembersQuery }): Promise<PaginatedList<MemberListDto>> => {
      if (!currentFamilyId) {
        throw new Error(t('memberSearch.errors.noFamilyId'));
      }
      const result = await memberService.search({ ...filters, familyId: currentFamilyId, page: pageParam });
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(result.error?.message || t('memberSearch.errors.unknown'));
    },
    [currentFamilyId, t]
  );

  // Define the query key generation function
  const getMemberSearchQueryKey = useCallback((filters: SearchMembersQuery): QueryKey => {
    return ['members', 'search', currentFamilyId, filters];
  }, [currentFamilyId]);

  const initialQuery: SearchMembersQuery = useMemo(() => ({
    searchQuery: '',
    gender: undefined,
    isRoot: undefined,
    familyId: currentFamilyId || '', // Add familyId to initialQuery
  }), [currentFamilyId]);

  const renderMemberItem = useCallback(({ item }: { item: MemberListDto }) => (
    <MemberItem item={item} />
  ), []);

  return (
    <View style={styles.safeArea}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('familyDetail.tab.members')} />
      </Appbar.Header>
      <View style={{ flex: 1 }}>
        <PaginatedSearchListV2<MemberListDto, SearchMembersQuery>
          queryKey={getMemberSearchQueryKey}
          queryFn={memberSearchQueryFn}
          initialFilters={initialQuery}
          renderItem={renderMemberItem}
          keyExtractor={(item) => item.id}
          searchPlaceholder={t('memberSearch.placeholder')}
          containerStyle={styles.container}
          showFilterButton={true}
          FilterComponent={MemberFilterComponent}
          ListEmptyComponent={<DefaultEmptyList styles={styles} t={t} />}
          externalDependencies={[currentFamilyId]} // Pass currentFamilyId as external dependency
        />
        {canManageFamily && currentFamilyId && (
          <FAB
            style={styles.fab}
            icon="plus"
            onPress={() => router.push(`/member/create?familyId=${currentFamilyId}`)}
          />
        )}
      </View>
    </View>
  );
}
