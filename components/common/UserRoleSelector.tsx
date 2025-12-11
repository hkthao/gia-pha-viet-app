import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Chip, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { UserCheckModal } from '@/components/common/UserCheckModal';
import { FamilyUserDto, FamilyRole, UserCheckResultDto } from '@/types';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';

interface UserRoleSelectorProps {
  title: string;
  familyUsers: FamilyUserDto[];
  role: FamilyRole;
  onAddUser: (user: UserCheckResultDto, role: FamilyRole) => void;
  onRemoveUser: (userId: string, role: FamilyRole) => void;
}

export const UserRoleSelector: React.FC<UserRoleSelectorProps> = ({
  title,
  familyUsers,
  role,
  onAddUser,
  onRemoveUser,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [isUserCheckModalVisible, setIsUserCheckModalVisible] = useState(false);

  const handleAddUserInternal = (user: UserCheckResultDto) => {
    onAddUser(user, role);
    setIsUserCheckModalVisible(false);
  };

  const styles = StyleSheet.create({
    formSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness,
      marginBottom: SPACING_MEDIUM,
    },
    sectionTitle: {
      fontWeight: 'bold',
      paddingBottom: SPACING_SMALL,
    },
    chipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING_SMALL,
      paddingVertical: SPACING_SMALL,
    },
    chip: {
      marginVertical: SPACING_SMALL / 2,
    },
    chipText: {
      fontSize: 14,
    },
    button: {
      marginBottom: SPACING_MEDIUM,
      borderRadius: theme.roundness,
    },
  });

  return (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipsContainer}>
        {familyUsers
          .filter((fu) => fu.role === role)
          .map((fu) => (
            <Chip
              key={fu.userId}
              onClose={() => onRemoveUser(fu.userId, role)}
              style={styles.chip}
              textStyle={styles.chipText}
            >
              {fu.userName || fu.userId}
            </Chip>
          ))}
      </View>
      <Button
        mode="outlined"
        onPress={() => setIsUserCheckModalVisible(true)}
        style={styles.button}
        icon="account-plus-outline"
      >
        {t('familyForm.addUser', { role: t(`familyForm.roles.${String(role).toLowerCase()}`) })}
      </Button>

      <UserCheckModal
        isVisible={isUserCheckModalVisible}
        onClose={() => setIsUserCheckModalVisible(false)}
        onAddUser={handleAddUserInternal}
      />
    </View>
  );
};