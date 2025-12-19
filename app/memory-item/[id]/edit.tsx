// gia-pha-viet-app/app/memory/[id]/edit.tsx

import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Appbar, useTheme, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MemoryItemForm } from '@/components/memory/MemoryItemForm';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import { useEditMemoryItem } from '@/hooks/memory/useEditMemoryItem';

export default function EditMemoryItemScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    initialMemoryItemData,
    isLoadingInitialData,
    fetchError,
    isUpdating,
    handleUpdateMemoryItem,
    handleCancel,
  } = useEditMemoryItem();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: SPACING_MEDIUM,
    },
    errorText: {
      color: theme.colors.error,
      textAlign: 'center',
    },
  });

  if (isLoadingInitialData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (fetchError) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="titleMedium" style={styles.errorText}>{fetchError}</Text>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleCancel} />
          <Appbar.Content title={t('memoryForm.editTitle')} />
        </Appbar.Header>
      </View>
    );
  }

  if (!initialMemoryItemData) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="titleMedium" style={styles.errorText}>{t('memory.errors.dataNotAvailable')}</Text>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleCancel} />
          <Appbar.Content title={t('memoryForm.editTitle')} />
        </Appbar.Header>
      </View>
    );
  }

  const processing = isLoadingInitialData || isUpdating;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleCancel} />
        <Appbar.Content title={initialMemoryItemData?.title || t('memoryForm.editTitle')} />
      </Appbar.Header>
      <MemoryItemForm
        initialValues={initialMemoryItemData}
        onSubmit={handleUpdateMemoryItem}
        isEditMode={true}
        familyId={initialMemoryItemData.familyId}
        processing={processing}
      />
    </View>
  );
}
