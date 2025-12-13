import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services';
import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Chip, TouchableRipple, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { UserListDto } from '@/types';
import { UserSelectModalComponent } from './UserSelectModal';
import { SPACING_SMALL, SPACING_MEDIUM, SPACING_EXTRA_LARGE } from '@/constants/dimensions';

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

  const { data: fetchedUsers } = useQuery<UserListDto[], Error, UserListDto[], [string, { userIds: string[] }]>({
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

  const styles = StyleSheet.create({
    container: {
      marginBottom: SPACING_MEDIUM,
    },
    dropdownContainer: {
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: theme.roundness,
      paddingHorizontal: SPACING_MEDIUM,
      paddingVertical: SPACING_SMALL,
      minHeight: 56, // Standard TextInput height
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },
    dropdownContent: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      minHeight: 30, // Adjust as needed
      marginLeft: SPACING_MEDIUM + 8
    },
    dropdownPlaceholder: {
      color: theme.colors.onSurfaceVariant,
    },
    chipWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      // No marginTop here, as it's part of the dropdownContent
    },
    chip: {
      marginRight: SPACING_SMALL,
      marginBottom: SPACING_SMALL / 2, // Adjust for better vertical spacing
      marginTop: SPACING_SMALL / 2, // Adjust for better vertical spacing
    },
    rightIconContainer: {
      position: 'absolute',
      right: SPACING_MEDIUM,
      top: '50%',
      transform: [{ translateY: -12 }], // Center vertically
      flexDirection: 'row',
      alignItems: 'center',
    },
    selectedCountText: {
      marginRight: SPACING_SMALL / 2,
      color: theme.colors.onSurfaceVariant,
    },
    errorText: {
      color: theme.colors.error,
      marginTop: SPACING_SMALL / 2,
      marginLeft: SPACING_MEDIUM,
    },
    leftIcon: {
      position: 'absolute',
      left: SPACING_MEDIUM + 5,
      top: '50%',
      transform: [{ translateY: -12 }], // Center vertically
    },
  });

  return (
    <View style={styles.container}>
      <TouchableRipple
        onPress={handleOpenModal}
        style={[
          styles.dropdownContainer,
          error && { borderColor: theme.colors.error },
          leftIcon && { paddingLeft: SPACING_EXTRA_LARGE + SPACING_SMALL }, // Make space for the icon
        ]}
      >
        <View>
          {label && (
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12, marginBottom: SPACING_MEDIUM }}>
              {label}
            </Text>
          )}
          <View style={styles.dropdownContent}>
            {selectedUsers.length > 0 ? (
              <View style={styles.chipWrapper}>
                {selectedUsers.map((user) => (
                  <Chip
                    key={user.id}
                    icon="account"
                    onClose={() => handleRemoveUser(user)}
                    style={styles.chip}
                  >
                    {user.email}
                  </Chip>
                ))}
              </View>
            ) : (
              <Text style={styles.dropdownPlaceholder}>
                {t('userSelectInput.selectUsers')}
              </Text>
            )}
          </View>
        </View>
      </TouchableRipple>
      {leftIcon && (
        <MaterialCommunityIcons
          name={leftIcon as any}
          size={24}
          color={theme.colors.onSurfaceVariant}
          style={styles.leftIcon}
        />
      )}
      <View style={styles.rightIconContainer}>
        {selectedUsers.length > 0 && (
          <Text style={styles.selectedCountText}>({selectedUsers.length})</Text>
        )}
        <MaterialCommunityIcons
          name="chevron-down"
          size={24}
          color={theme.colors.onSurface}
        />
      </View>
      {helperText && error && (
        <HelperText type="error" visible={error}>
          {helperText}
        </HelperText>
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
