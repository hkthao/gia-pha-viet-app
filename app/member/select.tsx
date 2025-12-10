import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import { PaginatedSearchList } from '@/components/common/PaginatedSearchList';
import { useMemberSearchList } from '@/hooks/useMemberSearchList';
import { MemberItem } from '@/components';
import { MemberListDto, SearchMembersQuery } from '@/types';
import { useFamilyStore } from '@/stores/useFamilyStore';


export default function MemberSelectScreen() {
  const { t } = useTranslation();
  const { returnTo, fieldName } = useLocalSearchParams<{ returnTo: string, fieldName: string }>();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);

  // Use the useMemberSearchList hook
  const { useStore, styles: memberSearchListStyles } = useMemberSearchList();

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

  // Custom render item to add selection functionality
  const renderSelectableMemberItem = useCallback(({ item, index }: { item: MemberListDto, index: number }) => (
    <MemberItem item={item} onPress={() => handleSelectMember(item)} />
  ), [handleSelectMember]); // renderMemberItem is not needed here

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