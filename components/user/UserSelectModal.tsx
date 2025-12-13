import React, { useCallback } from 'react';
import { PaginatedSearchListV2 } from '@/components/common/PaginatedSearchListV2';
import { UserListDto, SearchUsersQuery } from '@/types';
import { Modal, Portal, Text, IconButton, Chip, Button } from 'react-native-paper';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SPACING_SMALL } from '@/constants/dimensions';
import DefaultEmptyList from '@/components/common/DefaultEmptyList';
import { useUserSelectModal } from '@/hooks/user/useUserSelectModal';
import { UserItem } from './UserItem'; // Assuming a UserItem component will be created

const styles = StyleSheet.create({
  headerStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  titleStyle: {
    textAlign: "center",
    flex: 1,
  },
  selectedUsersContainer: {
    minHeight: 40,
    marginBottom: SPACING_SMALL,
  },
  selectedUsersContentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  chip: {
    margin: SPACING_SMALL / 2,
  },
  footer: {
    padding: SPACING_SMALL,
  }
});

interface UserSelectModalProps {
  isVisible: boolean;
  onClose: () => void;
  onUsersSelected: (users: UserListDto[]) => void;
  initialSelectedUsers?: UserListDto[];
}

const UserSelectModalComponent: React.FC<UserSelectModalProps> = ({
  isVisible,
  onClose,
  onUsersSelected,
  initialSelectedUsers,
}) => {
  const {
    userSearchQueryFn,
    getUserSearchQueryKey,
    initialQuery,
    handleUserToggle,
    handleConfirmSelection,
    selectedUsers,
    containerStyle,
    modalStyle,
    screenHeight,
    t,
  } = useUserSelectModal({ onUsersSelected, onClose, initialSelectedUsers });

  const customRenderItem = useCallback(({ item }: { item: UserListDto }) => (
    <UserItem user={item} onToggle={handleUserToggle} isSelected={selectedUsers.some(u => u.id === item.id)} />
  ), [handleUserToggle, selectedUsers]);

  return (
    <Portal>
      <Modal visible={isVisible}
        onDismiss={onClose}
        style={modalStyle}
        contentContainerStyle={[containerStyle, {
          position: "relative",
          height: screenHeight,
          justifyContent: 'space-between',
        }]}>

        <View style={styles.headerStyle}>
          <Text style={styles.titleStyle} variant="headlineSmall">{t('userSelectModal.title')}</Text>
          <IconButton icon="close" onPress={onClose} />
        </View>
        <View>
          <ScrollView
            horizontal={true}
            style={styles.selectedUsersContainer}
            contentContainerStyle={styles.selectedUsersContentContainer}
          >
            {selectedUsers.map(user => (
              <Chip
                key={user.id}
                icon="account"
                onClose={() => handleUserToggle(user)}
                style={styles.chip}
              >
                {user.email}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <View style={{
          flex: 1,
          height: 100,
        }}>

          <PaginatedSearchListV2<UserListDto, SearchUsersQuery>
            queryKey={getUserSearchQueryKey}
            queryFn={userSearchQueryFn}
            initialFilters={initialQuery}
            renderItem={customRenderItem}
            keyExtractor={(item) => item.id}
            searchPlaceholder={t('userSearch.placeholder')}
            containerStyle={{
              backgroundColor: modalStyle.backgroundColor
            }}
            showFilterButton={false}
            ListEmptyComponent={<DefaultEmptyList styles={styles} t={t} />}
          />

        </View>
        <View style={styles.footer}>
          <Button mode="contained" onPress={handleConfirmSelection}>
            {t('common.confirm')} ({selectedUsers.length})
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

export { UserSelectModalComponent };