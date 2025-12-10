import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedSearchList } from '@/components/common/PaginatedSearchList';
import { useMemberSearchList } from '@/hooks/useMemberSearchList';
import { MemberItem } from '@/components';
import { MemberListDto, SearchMembersQuery } from '@/types';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { Modal, Portal, useTheme, Text, IconButton } from 'react-native-paper';
import { Dimensions, View, StyleSheet } from 'react-native';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';

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

  const { useStore } = useMemberSearchList();

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
      <Modal visible={isVisible} onDismiss={onClose} style={modalStyle} contentContainerStyle={containerStyle}>
          <View style={styles.headerStyle}>
            <Text style={styles.titleStyle} variant="headlineSmall">{t('memberSelectModal.title')}</Text>
            <IconButton icon="close" onPress={onClose} ></IconButton>
          </View>
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

export default MemberSelectModalComponent;