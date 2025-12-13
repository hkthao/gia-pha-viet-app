import React from 'react';
import { PaginatedSearchListV2 } from '@/components/common/PaginatedSearchListV2';
import { MemberItem } from '@/components/member';
import { MemberListDto, SearchMembersQuery } from '@/types';
import { Modal, Portal, Text, IconButton } from 'react-native-paper';
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
  onSelectMember: (member: MemberListDto, fieldName: TFieldName) => void;
  fieldName: TFieldName;
}

const MemberSelectModalComponent = <TFieldName extends string>({
  isVisible,
  onClose,
  onSelectMember,
  fieldName,
}: MemberSelectModalProps<TFieldName>) => {
  const {
    memberSearchQueryFn,
    getMemberSearchQueryKey,
    initialQuery,
    handleMemberPress,
    containerStyle,
    modalStyle,
    currentFamilyId,
    screenHeight,
    t,
  } = useMemberSelectModal({ onSelectMember, fieldName, onClose });

  const customRenderItem = ({ item }: { item: MemberListDto, index: number }) => (
    <MemberItem item={item} onPress={() => handleMemberPress(item)} />
  );

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