import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedSearchList } from '@/components/common/PaginatedSearchList';
import { useMemberSearchList } from '@/hooks/useMemberSearchList';
import { MemberItem } from '@/components';
import { MemberListDto, SearchMembersQuery } from '@/types';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { Modal, Portal, useTheme } from 'react-native-paper';
import { Dimensions } from 'react-native'; // Import Dimensions
import { SPACING_SMALL } from '@/constants/dimensions';

const screenHeight = Dimensions.get('window').height;

// -----------------------------------------------------------------------------
// MemberSelectModal Component
// -----------------------------------------------------------------------------
interface MemberSelectModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectMember: (member: MemberListDto, fieldName: 'member1' | 'member2') => void;
  fieldName: 'member1' | 'member2'; // To indicate which member is being selected (member1 or member2)
}

const MemberSelectModalComponent: React.FC<MemberSelectModalProps> = ({
  isVisible,
  onClose,
  onSelectMember,
  fieldName,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);

  const { useStore } = useMemberSearchList();
  // query, setQuery, search are not needed here if PaginatedSearchList handles it internally

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
  }), [theme.colors.background, theme.roundness]);

  const modalStyle = useMemo(() => ({
    backgroundColor: theme.colors.background
  }), [theme.colors.background, theme.roundness]);

  return (
    <Portal>
      <Modal visible={isVisible} onDismiss={onClose} style={modalStyle} contentContainerStyle={containerStyle}>
        <PaginatedSearchList<MemberListDto, SearchMembersQuery>
          useStore={() => useStore}
          searchOptions={{
            initialQuery: { familyId: currentFamilyId || '', searchQuery: '' },
            externalDependencies: [currentFamilyId],
            debounceTime: 400,
          }}
          renderItem={customRenderItem}
          keyExtractor={(item) => item.id}
          searchPlaceholder={t('memberSearch.placeholder')}
          containerStyle={{
            height: screenHeight * 0.9,
            backgroundColor: theme.colors.background
          }}
          showFilterButton={false}
        />
      </Modal>
    </Portal>
  );
};

// -----------------------------------------------------------------------------
// useMemberSelectModal Hook
// -----------------------------------------------------------------------------
interface UseMemberSelectModal {
  showMemberSelectModal: (onSelect: (member: MemberListDto, fieldName: 'member1' | 'member2') => void, fieldName: 'member1' | 'member2') => void;
  MemberSelectModal: React.FC;
}

export function useMemberSelectModal(): UseMemberSelectModal {
  const [isVisible, setIsVisible] = useState(false);
  const [selectCallback, setSelectCallback] = useState<(member: MemberListDto, fieldName: 'member1' | 'member2') => void>(() => () => { });
  const [currentFieldName, setCurrentFieldName] = useState<'member1' | 'member2'>('member1');

  const showMemberSelectModal = useCallback(
    (onSelect: (member: MemberListDto, fieldName: 'member1' | 'member2') => void, fieldName: 'member1' | 'member2') => {
      setSelectCallback(() => onSelect);
      setCurrentFieldName(fieldName);
      setIsVisible(true);
    },
    []
  );

  const hideModal = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleSelectMember = useCallback(
    (member: MemberListDto, fieldName: 'member1' | 'member2') => {
      selectCallback(member, fieldName);
      hideModal();
    },
    [selectCallback, hideModal]
  );

  const MemoizedMemberSelectModal = useMemo(() => {
    const Component: React.FC = () => (
      <MemberSelectModalComponent
        isVisible={isVisible}
        onClose={hideModal}
        onSelectMember={handleSelectMember}
        fieldName={currentFieldName}
      />
    );
    return Component;
  }, [isVisible, hideModal, handleSelectMember, currentFieldName]);

  return {
    showMemberSelectModal,
    MemberSelectModal: MemoizedMemberSelectModal,
  };
}