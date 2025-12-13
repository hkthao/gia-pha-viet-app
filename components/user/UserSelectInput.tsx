import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text, useTheme, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { UserListDto } from '@/types';
import { UserSelectModalComponent } from './UserSelectModal';
import { SPACING_SMALL, SPACING_MEDIUM } from '@/constants/dimensions';

interface UserSelectInputProps {
  selectedUsers: UserListDto[];
  label?: string;
  onUsersChanged: (users: UserListDto[]) => void;
  error?: boolean;
  helperText?: string;
  leftIcon?: string;
}

const UserSelectInput: React.FC<UserSelectInputProps> = ({
  selectedUsers,
  label,
  onUsersChanged,
  error,
  helperText,
  leftIcon,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleUsersSelectedFromModal = useCallback((users: UserListDto[]) => {
    onUsersChanged(users);
    setModalVisible(false);
  }, [onUsersChanged]);

  const handleRemoveUser = useCallback((userToRemove: UserListDto) => {
    onUsersChanged(selectedUsers.filter(user => user.id !== userToRemove.id));
  }, [selectedUsers, onUsersChanged]);

  const displayValue = selectedUsers.length > 0
    ? selectedUsers.map(user => user.fullName).join(', ')
    : t('userSelectInput.selectUsers');

  const styles = StyleSheet.create({
    container: {
      marginBottom: SPACING_MEDIUM,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: SPACING_SMALL,
    },
    chip: {
      marginRight: SPACING_SMALL,
      marginBottom: SPACING_SMALL,
    },
    textInput: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    rightInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    selectedCountText: {
      marginRight: SPACING_SMALL / 2,
      color: theme.colors.onSurfaceVariant,
    },
  });

  return (
    <View style={styles.container}>
      <TextInput
        label={label || t('userSelectInput.selectUsers')}
        value={displayValue}
        mode="outlined"
        readOnly
        onPress={handleOpenModal}
        left={leftIcon ? <TextInput.Icon icon={leftIcon} /> : undefined}
        right={
          <View style={styles.rightInputContainer}>
            {selectedUsers.length > 0 && (
              <Text style={styles.selectedCountText}>({selectedUsers.length})</Text>
            )}
            <TextInput.Icon
              icon="chevron-down"
              onPress={handleOpenModal}
            />
          </View>
        }
        error={error}
        style={styles.textInput}
      />
      {helperText && error && <Text style={{ color: theme.colors.error }}>{helperText}</Text>}
      {selectedUsers.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
          {selectedUsers.map(user => (
            <Chip
              key={user.id}
              icon="account"
              onClose={() => handleRemoveUser(user)}
              style={styles.chip}
            >
              {user.fullName}
            </Chip>
          ))}
        </ScrollView>
      )}


      <UserSelectModalComponent
        isVisible={modalVisible}
        onClose={handleCloseModal}
        onUsersSelected={handleUsersSelectedFromModal}
        initialSelectedUsers={selectedUsers}
      />
    </View>
  );
};

export { UserSelectInput };
