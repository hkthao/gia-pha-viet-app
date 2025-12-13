import React from 'react';
import { StyleSheet } from 'react-native';
import { List, useTheme } from 'react-native-paper';
import { UserListDto } from '@/types';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';

interface UserItemProps {
  user: UserListDto;
  onToggle: (user: UserListDto) => void;
  isSelected: boolean;
}

const UserItem: React.FC<UserItemProps> = ({ user, onToggle, isSelected }) => {
  const theme = useTheme();

  return (
    <List.Item
      title={user.email}
      left={() => <List.Icon icon={isSelected ? "check-circle" : "account-circle-outline"} color={isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant} />}
      onPress={() => onToggle(user)}
      style={[
        styles.itemContainer,
        { backgroundColor: isSelected ? theme.colors.primaryContainer : theme.colors.background }
      ]}
      titleStyle={{ color: isSelected ? theme.colors.onPrimaryContainer : theme.colors.onSurface }}
      descriptionStyle={{ color: isSelected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }}
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    marginVertical: SPACING_SMALL / 2,
    borderRadius: SPACING_SMALL,
    padding: SPACING_MEDIUM,
  },
});

export { UserItem };