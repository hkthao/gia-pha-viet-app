// gia-pha-viet-app/app/memory/create.tsx

import React, { useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MemoryItemForm } from '@/components/memory/MemoryItemForm';
import { MemoryItemFormData } from '@/utils/validation/memoryItemValidationSchema';
import { useCreateMemoryItem } from '@/hooks/memory/useCreateMemoryItem';
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore';

export default function CreateMemoryItemScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { currentFamilyId } = useCurrentFamilyStore();
  const { mutate: createMemoryItem, isPending: isSubmitting } = useCreateMemoryItem();

  const handleCreateMemoryItem = useCallback(async (data: MemoryItemFormData) => {
    if (!currentFamilyId) {
      Alert.alert(t('common.error'), t('memory.selectFamilyPrompt'));
      return;
    }
    createMemoryItem({ ...data, familyId: currentFamilyId }, {
      onSuccess: () => {
        router.back();
      },
      onError: (error) => {
        Alert.alert(t('common.error'), error.message || t('common.error_occurred'));
      },
    });
  }, [createMemoryItem, router, currentFamilyId, t]);

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
        <Appbar.Content title={t('memoryForm.createTitle')} titleStyle={{ color: theme.colors.onSurface }} />
      </Appbar.Header>
      <MemoryItemForm onSubmit={handleCreateMemoryItem} isEditMode={false} />
    </View>
  );
}
