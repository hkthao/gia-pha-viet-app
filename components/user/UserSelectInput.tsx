import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services';
import { SearchUsersQuery } from '@/types';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text, useTheme, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { UserListDto } from '@/types';
import { UserSelectModalComponent } from './UserSelectModal';
import { SPACING_SMALL, SPACING_MEDIUM } from '@/constants/dimensions';

interface UserSelectInputProps {
  userIds: string[];
  label?: string;
  onUserIdsChanged: (userIds: string[]) => void;
  error?: boolean;
  helperText?: string;
  leftIcon?: string;
}

const UserSelectInput: React.FC<UserSelectInputProps> = ({
  userIds,
  label,
  onUserIdsChanged,
  error,
  helperText,
  leftIcon,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const { data: fetchedUsers, isLoading: isFetchingUsers } = useQuery<UserListDto[], Error, UserListDto[], [string, { userIds: string[] }]>({
    queryKey: ['users', { userIds }],
    queryFn: async ({ queryKey }) => {
      const [, { userIds: idsToFetch }] = queryKey;
      if (!idsToFetch || idsToFetch.length === 0) {
        return [];
      }
      const result = await userService.getByIds(idsToFetch);
      return result;
    },
    enabled: userIds && userIds.length > 0,
    staleTime: Infinity,
  });

  const selectedUsers = useMemo(() => fetchedUsers || [], [fetchedUsers]);

  const handleOpenModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleUsersSelectedFromModal = useCallback((users: UserListDto[]) => {
    onUserIdsChanged(users.map(u => u.id)); // Emit user IDs
    setModalVisible(false);
  }, [onUserIdsChanged]);

  const handleRemoveUser = useCallback((userToRemove: UserListDto) => {
    onUserIdsChanged(selectedUsers.filter(user => user.id !== userToRemove.id).map(u => u.id)); // Emit user IDs
  }, [selectedUsers, onUserIdsChanged]);
  const displayValue = selectedUsers.length > 0
    ? selectedUsers.map(user => user.email).join(', ')
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
              {user.email}
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
