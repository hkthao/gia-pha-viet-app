import React, { useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FamilyLocationForm } from '@/components/familyLocation';
import { FamilyLocationFormData } from '@/utils/validation/familyLocationValidationSchema';
import { useCreateFamilyLocation } from '@/hooks/familyLocation/useFamilyLocationQueries';
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore';

export default function CreateFamilyLocationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { currentFamilyId } = useCurrentFamilyStore();
  const { mutate: createFamilyLocation, isPending: isSubmitting } = useCreateFamilyLocation();

  const handleCreateFamilyLocation = useCallback(async (data: FamilyLocationFormData) => {
    if (!currentFamilyId) {
      Alert.alert(t('common.error'), t('familyLocation.selectFamilyPrompt'));
      return;
    }
    createFamilyLocation({ ...data, familyId: currentFamilyId }, {
      onSuccess: () => {
        router.back();
      },
      onError: (error) => {
        Alert.alert(t('common.error'), error.message || t('common.error_occurred'));
      },
    });
  }, [createFamilyLocation, router, currentFamilyId, t]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={handleCancel} color={theme.colors.onSurface} />
        <Appbar.Content title={t('familyLocationForm.createTitle')} titleStyle={{ color: theme.colors.onSurface }} />
      </Appbar.Header>
      <FamilyLocationForm onSubmit={handleCreateFamilyLocation} isSubmitting={isSubmitting} />
    </View>
  );
}
