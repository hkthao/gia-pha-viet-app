import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, useTheme, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SPACING_MEDIUM } from '@/constants/dimensions';

export default function FaceDataDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();

  const faceDataId = Array.isArray(id) ? id[0] : id;

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flexGrow: 1,
      padding: SPACING_MEDIUM,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      {/* Appbar.Header removed, will be provided by parent layout */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium">Face Data ID: {faceDataId}</Text>
        <Text variant="bodyLarge" style={{ marginTop: SPACING_MEDIUM }}>
          {t('faceDataDetail.placeholder')} {/* Placeholder for actual details */}
        </Text>
      </ScrollView>
    </View>
  );
}