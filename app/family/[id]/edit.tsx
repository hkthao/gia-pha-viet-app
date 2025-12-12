import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Appbar, useTheme, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { FamilyForm } from '@/components/family';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import { useEditFamilyForm } from '@/hooks/family/useEditFamilyForm';

export default function EditFamilyScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    initialFamilyData,
    isLoadingInitialData,
    fetchError,
    isSubmitting,
    handleUpdateFamily,
    handleCancel,
  } = useEditFamilyForm();

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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleCancel} />
        <Appbar.Content title={initialFamilyData?.name || t('familyForm.editTitle')} />
      </Appbar.Header>
      <FamilyForm
        initialValues={initialFamilyData}
        onSubmit={handleUpdateFamily}
      />
    </View>
  );
}
