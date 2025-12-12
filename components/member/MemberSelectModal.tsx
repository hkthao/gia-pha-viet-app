import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedSearchListV2 } from '@/components/common/PaginatedSearchListV2'; // Use V2
import { MemberItem } from '@/components/member';
import { MemberListDto, SearchMembersQuery, PaginatedList } from '@/types';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { Modal, Portal, useTheme, Text, IconButton } from 'react-native-paper';
import { Dimensions, View, StyleSheet } from 'react-native';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { memberService } from '@/services'; // Import memberService
import type { QueryKey } from '@tanstack/react-query'; // Import QueryKey
import DefaultEmptyList from '@/components/common/DefaultEmptyList'; // Import DefaultEmptyList

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  headerStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: SPACING_MEDIUM,
  },
  titleStyle: {
    textAlign: "center",
    flex: 1,
  }
});

// -----------------------------------------------------------------------------
// MemberSelectModal Component
// -----------------------------------------------------------------------------
interface MemberSelectModalProps<TFieldName extends string> {
  isVisible: boolean;
  onClose: () => void;
  onSelectMember: (member: MemberListDto, fieldName: TFieldName) => void;
  fieldName: TFieldName;
}

const MemberSelectModalComponent = <TFieldName extends string>({
  isVisible,
  onClose,
  onSelectMember,
  fieldName,
}: MemberSelectModalProps<TFieldName>) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);

  // Define the query function for fetching member data
  const memberSearchQueryFn = useCallback(
    async ({ pageParam = 1, filters }: { pageParam?: number; queryKey: QueryKey; filters: SearchMembersQuery }): Promise<PaginatedList<MemberListDto>> => {
      if (!currentFamilyId) {
        // This case should ideally be handled by disabling the query if currentFamilyId is null
        // or by ensuring the modal isn't visible without a family context.
        return { items: [], page: 1, totalPages: 0, totalItems: 0 };
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
    return ['members', 'modalSearch', currentFamilyId, filters];
  }, [currentFamilyId]);

  const initialQuery: SearchMembersQuery = useMemo(() => ({
    searchQuery: '',
    gender: undefined,
    isRoot: undefined,
    familyId: currentFamilyId || '',
  }), [currentFamilyId]);

  const handleMemberPress = useCallback((member: MemberListDto) => {
    onSelectMember(member, fieldName);
    onClose();
  }, [onSelectMember, onClose, fieldName]);

  const customRenderItem = useCallback(({ item }: { item: MemberListDto, index: number }) => (
    <MemberItem item={item} onPress={() => handleMemberPress(item)} />
  ), [handleMemberPress]);

  const containerStyle = useMemo(() => ({
    padding: SPACING_SMALL,
    borderRadius: theme.roundness,
    flex: 1,
  }), [theme]);

  const modalStyle = useMemo(() => ({
    backgroundColor: theme.colors.background
  }), [theme]);


  return (
    <Portal>
      <Modal visible={isVisible}
        onDismiss={onClose} style={modalStyle}
        contentContainerStyle={containerStyle}>
        <View style={styles.headerStyle}>
          <Text style={styles.titleStyle} variant="headlineSmall">{t('memberSelectModal.title')}</Text>
          <IconButton icon="close" onPress={onClose} ></IconButton>
        </View>
        <PaginatedSearchListV2<MemberListDto, SearchMembersQuery>
          queryKey={getMemberSearchQueryKey}
          queryFn={memberSearchQueryFn}
          initialFilters={initialQuery}
          renderItem={customRenderItem}
          keyExtractor={(item) => item.id}
          searchPlaceholder={t('memberSearch.placeholder')}
          containerStyle={{
            height: screenHeight * 0.9,
            backgroundColor: theme.colors.background
          }}
          showFilterButton={false}
          externalDependencies={[currentFamilyId]} // Pass currentFamilyId as external dependency
          ListEmptyComponent={<DefaultEmptyList styles={styles} t={t} />}
        />
      </Modal>
    </Portal>
  );
};

export default MemberSelectModalComponent;