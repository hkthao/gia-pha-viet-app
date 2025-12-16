import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { FamilyForm } from '@/components/family';
import { ChatBottomSheet } from '@/components'; // Import ChatBottomSheet
import { useCreateFamily } from '@/hooks/family/useCreateFamily'; // Import the new hook
import { FamilyFormData } from '@/utils/validation/familyValidationSchema'; // Import FamilyFormData

export default function CreateFamilyScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { createFamily } = useCreateFamily(); // Use the new hook
  const [isChatBottomSheetVisible, setIsChatBottomSheetVisible] = useState(false); // State for bottom sheet visibility

  const handleSubmit = useCallback(async (data: FamilyFormData) => {
    // createFamily already handles navigation and snackbar through react-query's onSuccess/onError
    await createFamily(data);
  }, [createFamily]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleSendMessage = useCallback((message: string) => {
    console.log('Message sent:', message);
    // TODO: Implement actual AI integration here
    setIsChatBottomSheetVisible(false); // Close after sending
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleCancel} />
        <Appbar.Content title={t('familyForm.createTitle')} />
        <Appbar.Action
          icon="robot-outline" // AI icon
          onPress={() => setIsChatBottomSheetVisible(true)}
        />
      </Appbar.Header>
      <FamilyForm
        onSubmit={handleSubmit} // Pass the wrapped function
      />
      <ChatBottomSheet
        isVisible={isChatBottomSheetVisible}
        onClose={() => setIsChatBottomSheetVisible(false)}
        onSendMessage={handleSendMessage}
      />
    </View>
  );
}
