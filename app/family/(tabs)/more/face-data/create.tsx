import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, useTheme, Text, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import { useFamilyStore } from '@/stores/useFamilyStore'; // To get current family ID

export default function CreateFaceDataScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleSubmit = useCallback(() => {
    // TODO: Implement face data creation logic
    console.log('Submit face data');
    router.back(); // Navigate back after submission (for now)
  }, [router]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flexGrow: 1,
      padding: SPACING_MEDIUM,
    },
    noFamilyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (!currentFamilyId) {
    return (
      <View style={styles.noFamilyContainer}>
        <Text>{t('faceSearch.noFamilyIdSelected')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleCancel} />
        <Appbar.Content title={t('faceDataForm.createTitle')} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="bodyLarge" style={{ marginBottom: SPACING_MEDIUM }}>
          {t('faceDataForm.createDescription')} {/* Placeholder for description */}
        </Text>
        {/* TODO: Add actual form fields for image upload and member selection */}
        <Button mode="contained" onPress={handleSubmit}>
          {t('common.save')}
        </Button>
      </ScrollView>
    </View>
  );
}