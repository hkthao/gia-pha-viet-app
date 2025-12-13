import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, ActivityIndicator, FAB } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import { ProfileCard, DetailedInfoCard } from '@/components/family';
import { useFamilyDetails } from '@/hooks/family/useFamilyDetails'; // Import the combined hook

export default function FamilyDetailsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    family,
    isLoading,
    isError,
    error,
    canEditOrDelete,
    handleEditFamily,
    handleDeleteFamily,
  } = useFamilyDetails();

  const [fabOpen, setFabOpen] = useState(false); // State to manage FAB.Group open/closed status

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    appbar: {
    },
    content: {
      padding: SPACING_MEDIUM,
      paddingBottom: SPACING_MEDIUM * 4, // Add padding for FAB to not overlap content
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
    fabStyle: {
      position: 'absolute',
      margin: SPACING_MEDIUM,
      right: 0,
      bottom: 0,
      zIndex: 10,
    },
  }), [theme]); // eslint-disable-line react-hooks/exhaustive-deps

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

      {canEditOrDelete && (
        <FAB.Group
          visible={true} // Always visible when conditions met
          open={fabOpen} // Use state to control open/closed status
          icon={fabOpen ? 'close' : 'pencil'} // Change icon based on open state
          actions={[
            {
              icon: 'pencil',
              label: t('common.edit'),
              onPress: handleEditFamily,
            },
            {
              icon: 'delete',
              label: t('common.delete'),
              onPress: handleDeleteFamily,
            },
          ]}
          onStateChange={({ open }) => setFabOpen(open)} // Update state on state change
          fabStyle={styles.fabStyle}
          color={theme.colors.onPrimary}
        />
      )}
    </View>
  );
}