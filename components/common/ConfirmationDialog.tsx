import React from 'react';
import { Dialog, Portal, Button, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

interface ConfirmationDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string; // Made optional
  message?: string; // Made optional
  onConfirm: () => void;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  onDismiss,
  title,
  message,
  onConfirm,
  loading = false,
  confirmText,
  cancelText,
  confirmButtonColor,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const styles = StyleSheet.create({
    dialogButton: {
      borderRadius: theme.roundness,
      minWidth: 80, 
    },
  });

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={{ borderRadius: theme.roundness }}>
        <Dialog.Title>{title || t('dialog.confirmTitle')}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{message || t('dialog.confirmMessage')}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={loading} mode="text" style={styles.dialogButton} >
            {cancelText || t('common.cancel')}
          </Button>
          <Button
            onPress={onConfirm}
            loading={loading}
            disabled={loading}
            mode="text" // Changed to text mode
            buttonColor={confirmButtonColor || theme.colors.error}
            style={styles.dialogButton}
            textColor={theme.colors.onError} // Explicitly set text color for contrast
          >
            {confirmText || t('common.confirm')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ConfirmationDialog;
