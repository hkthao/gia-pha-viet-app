import React, { useState, useCallback } from 'react';
import { PaginatedSearchListV2 } from '@/components/common/PaginatedSearchListV2';
import MemberItem from './MemberItem';
import { MemberListDto, SearchMembersQuery } from '@/types';
import { Modal, Portal, Text, IconButton, Button } from 'react-native-paper'; // Added Button
import { View, StyleSheet } from 'react-native';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import DefaultEmptyList from '@/components/common/DefaultEmptyList';
import { useMemberSelectModal } from '@/hooks/member/useMemberSelectModal';

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

interface MemberSelectModalProps<TFieldName extends string> {
  isVisible: boolean;
  onClose: () => void;
  onSelectSingleMember?: (member: MemberListDto, fieldName: TFieldName) => void;
  onSelectMultipleMembers?: (members: MemberListDto[], fieldName: TFieldName) => void;
  fieldName: TFieldName;
  multiSelect?: boolean;
  initialSelectedMembers?: MemberListDto[];
}

const MemberSelectModalComponent = <TFieldName extends string>({
  isVisible,
  onClose,
  onSelectSingleMember,
  onSelectMultipleMembers,
  fieldName,
  multiSelect = false,
  initialSelectedMembers = [],
}: MemberSelectModalProps<TFieldName>) => {
  const {
    memberSearchQueryFn,
    getMemberSearchQueryKey,
    initialQuery,
    containerStyle,
    modalStyle,
    currentFamilyId,
    screenHeight,
    t,
  } = useMemberSelectModal({ fieldName, onClose }); // Removed handleMemberPress from here, as modal will handle its own member selection logic internally

  const [currentSelectedMembers, setCurrentSelectedMembers] = useState<MemberListDto[]>(initialSelectedMembers);

  React.useEffect(() => {
    setCurrentSelectedMembers(initialSelectedMembers);
  }, [initialSelectedMembers]);


  const handleMemberPress = useCallback((member: MemberListDto) => {
    if (multiSelect) {
      setCurrentSelectedMembers(prev => {
        const isAlreadySelected = prev.some(m => m.id === member.id);
        if (isAlreadySelected) {
          return prev.filter(m => m.id !== member.id); // Deselect
        } else {
          return [...prev, member]; // Select
        }
      });
    } else {
      onSelectSingleMember?.(member, fieldName);
      onClose();
    }
  }, [multiSelect, onSelectSingleMember, fieldName, onClose]);

  const handleConfirmSelection = useCallback(() => {
    onSelectMultipleMembers?.(currentSelectedMembers, fieldName);
    onClose();
  }, [onSelectMultipleMembers, currentSelectedMembers, fieldName, onClose]);

  const customRenderItem = ({ item }: { item: MemberListDto, index: number }) => (
    <MemberItem
      item={item}
      onPress={() => handleMemberPress(item)}
      isSelected={multiSelect && currentSelectedMembers.some(m => m.id === item.id)}
    />
  );

  return (
    <Portal>
      <Modal visible={isVisible}
        onDismiss={onClose} style={modalStyle}
        contentContainerStyle={containerStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING_MEDIUM, marginBottom: SPACING_MEDIUM }}>
          <IconButton icon="close" onPress={onClose} />
          <Text style={{ flex: 1, textAlign: 'center' }} variant="headlineSmall">{t('memberSelectModal.title')}</Text>
          {multiSelect && (
            <IconButton
              icon="check"
              onPress={handleConfirmSelection}
              disabled={currentSelectedMembers.length === 0}
            />
          )}
        </View>
        <PaginatedSearchListV2<MemberListDto, SearchMembersQuery>
          queryKey={getMemberSearchQueryKey}
          queryFn={memberSearchQueryFn}
          initialFilters={initialQuery}
          renderItem={customRenderItem}
          keyExtractor={(item) => item.id}
          searchPlaceholder={t('memberSearch.placeholder')}
          containerStyle={{
            height: screenHeight * 0.9 - 60, // Adjust height to account for header buttons
            backgroundColor: modalStyle.backgroundColor
          }}
          showFilterButton={false}
          externalDependencies={[currentFamilyId]}
          ListEmptyComponent={<DefaultEmptyList styles={styles} t={t} />}
        />
      </Modal>
    </Portal>
  );
};

export default MemberSelectModalComponent;