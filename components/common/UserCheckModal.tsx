import React, { useState } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { userService } from '@/services';
import { UserCheckResultDto } from '@/services/user/user.service.interface';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';

interface UserCheckModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddUser: (user: UserCheckResultDto) => void;
}

export const UserCheckModal: React.FC<UserCheckModalProps> = ({ isVisible, onClose, onAddUser }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [identifier, setIdentifier] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [foundUser, setFoundUser] = useState<UserCheckResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckUser = async () => {
    if (!identifier.trim()) {
      setError(t('userCheckModal.validation.identifierRequired'));
      return;
    }

    setLoading(true);
    setFoundUser(null);
    setError(null);

    try {
      const user = await userService.checkUserByEmailOrUsername(identifier);
      setFoundUser(user);
    } catch (err: any) {
      setError(err.response?.data?.message || t('userCheckModal.error.notFound'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    if (foundUser) {
      onAddUser(foundUser);
      onClose(); // Close modal after adding
      resetState();
    }
  };

  const resetState = () => {
    setIdentifier('');
    setLoading(false);
    setFoundUser(null);
    setError(null);
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
      width: '90%',
      backgroundColor: theme.colors.background,
      borderRadius: theme.roundness,
      padding: SPACING_MEDIUM,
      elevation: 5,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: SPACING_MEDIUM,
      color: theme.colors.onSurface,
    },
    input: {
      marginBottom: SPACING_MEDIUM,
      backgroundColor: theme.colors.surface,
    },
    userInfoContainer: {
      marginTop: SPACING_MEDIUM,
      padding: SPACING_MEDIUM,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.roundness,
      marginBottom: SPACING_MEDIUM,
    },
    userInfoText: {
      marginBottom: SPACING_SMALL,
      color: theme.colors.onSurfaceVariant,
    },
    errorText: {
      color: theme.colors.error,
      marginBottom: SPACING_MEDIUM,
      textAlign: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: SPACING_MEDIUM,
    },
    button: {
      marginLeft: SPACING_SMALL,
    },
  });

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{t('userCheckModal.title')}</Text>

          <TextInput
            label={t('userCheckModal.identifierPlaceholder')}
            mode="outlined"
            value={identifier}
            onChangeText={setIdentifier}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          {loading ? (
            <ActivityIndicator animating={true} color={theme.colors.primary} />
          ) : (
            <>
              {foundUser ? (
                <View style={styles.userInfoContainer}>
                  <Text style={styles.userInfoText}>{t('userCheckModal.userInfo')}</Text>
                  <Text style={styles.userInfoText}>
                    {t('userCheckModal.fullName')}: {foundUser.fullName}
                  </Text>
                  <Text style={styles.userInfoText}>
                    {t('userCheckModal.userName')}: {foundUser.userName}
                  </Text>
                  <Text style={styles.userInfoText}>
                    {t('userCheckModal.userId')}: {foundUser.userId}
                  </Text>
                </View>
              ) : null}

              <View style={styles.buttonContainer}>
                <Button mode="outlined" onPress={handleClose} style={styles.button}>
                  {t('common.cancel')}
                </Button>
                {foundUser ? (
                  <Button mode="contained" onPress={handleAddUser} style={styles.button}>
                    {t('userCheckModal.addThisUser')}
                  </Button>
                ) : (
                  <Button mode="contained" onPress={handleCheckUser} style={styles.button} disabled={!identifier.trim()}>
                    {t('userCheckModal.checkUser')}
                  </Button>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};
