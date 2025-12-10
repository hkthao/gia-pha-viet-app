import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native'; // Remove FlatList if not needed
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import { PaginatedSearchList } from '@/components/common/PaginatedSearchList'; // Re-import PaginatedSearchList
import { useMemberSearchList } from '@/hooks/useMemberSearchList'; // Keep this
import { MemberListDto, SearchMembersQuery } from '@/types'; // Ensure SearchMembersQuery is imported
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { useFamilyStore } from '@/stores/useFamilyStore'; // Import useFamilyStore

export default function MemberSelectScreen() {
  const { t } = useTranslation();
  const { returnTo, fieldName } = useLocalSearchParams<{ returnTo: string, fieldName: string }>();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId); // Get currentFamilyId

  // Use the useMemberSearchList hook
  const { useStore, renderMemberItem, styles: memberSearchListStyles } = useMemberSearchList();

  const handleSelectMember = useCallback((member: MemberListDto) => {
    router.navigate({
      pathname: returnTo as any,
      params: {
        selectedMemberId: member.id,
        selectedMemberName: member.fullName,
        fieldName: fieldName,
      },
    });
  }, [returnTo, fieldName]);

  const memberItemStyles = useMemo(() => StyleSheet.create({
    touchable: {
    },
  }), []);

  // Custom render item to add selection functionality
  const renderSelectableMemberItem = useCallback(({ item }: { item: MemberListDto, index: number }) => (
    <TouchableOpacity onPress={() => handleSelectMember(item)} style={memberItemStyles.touchable}>
      {renderMemberItem({ item })}
    </TouchableOpacity>
  ), [handleSelectMember, memberItemStyles.touchable, renderMemberItem]); // Include renderMemberItem in dependencies

  return (
    <View style={memberSearchListStyles.safeArea}>
      <PaginatedSearchList<MemberListDto, SearchMembersQuery>
        useStore={() => useStore} // Pass the useStore function
        searchOptions={{
          initialQuery: { familyId: currentFamilyId || '', searchQuery: '' },
          externalDependencies: [currentFamilyId],
          debounceTime: 400,
        }}
        renderItem={renderSelectableMemberItem}
        keyExtractor={(item) => item.id}
        searchPlaceholder={t('memberSearch.placeholder')}
        containerStyle={memberSearchListStyles.container}
        showFilterButton={false} // No filter button for selection screen
      />
    </View>
  );
}
