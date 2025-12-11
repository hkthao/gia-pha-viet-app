import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import { ProfileCard, DetailedInfoCard } from '@/components/family';
import { useFamilyDetails } from '@/hooks/family/useFamilyDetails';

export default function FamilyDetailsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  const { family, isLoading, isError, error } = useFamilyDetails();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    appbar: {
    },
    content: {
      padding: SPACING_MEDIUM,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING_MEDIUM,
    },
  }), [theme]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="titleMedium" style={{ color: theme.colors.error }}>{error?.message || t('common.error_occurred')}</Text>
      </View>
    );
  }

  if (!family) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="titleMedium">{t('common.error_occurred')}: {t('familyDetail.errors.dataNotAvailable')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ProfileCard family={family} />
        <DetailedInfoCard family={family} />
      </ScrollView>
    </View>
  );
}