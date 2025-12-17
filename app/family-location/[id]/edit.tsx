import React, { useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, useTheme, ActivityIndicator, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FamilyLocationForm } from '@/components/familyLocation';
import { FamilyLocationFormData } from '@/utils/validation/familyLocationValidationSchema';
import { useFamilyLocation, useUpdateFamilyLocation } from '@/hooks/familyLocation/useFamilyLocationQueries';
import { SPACING_MEDIUM } from '@/constants/dimensions';

export default function EditFamilyLocationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();

  const locationId = Array.isArray(id) ? id[0] : id;

  const { data: familyLocation, isLoading, error, refetch } = useFamilyLocation(locationId as string);
  const { mutate: updateFamilyLocation, isPending: isSubmitting } = useUpdateFamilyLocation();

  useEffect(() => {
    if (locationId) {
      refetch();
    }
  }, [locationId, refetch]);

  const initialValues: Partial<FamilyLocationFormData> | undefined = useMemo(() => {
    if (!familyLocation) return undefined;

    return {
      name: familyLocation.name,
      description: familyLocation.description || '',
      address: familyLocation.address || '',
      latitude: familyLocation.latitude,
      longitude: familyLocation.longitude,
      locationType: familyLocation.locationType,
      accuracy: familyLocation.accuracy,
      source: familyLocation.source,
      familyId: familyLocation.familyId,
    };
  }, [familyLocation]);

  const handleUpdateFamilyLocation = useCallback(async (data: FamilyLocationFormData) => {
    if (!locationId) {
      Alert.alert(t('common.error'), t('familyLocationForm.errors.locationIdMissing'));
      return;
    }
    updateFamilyLocation({ id: locationId, formData: data }, {
      onSuccess: () => {
        router.back();
      },
      onError: (err) => {
        Alert.alert(t('common.error'), err.message || t('common.error_occurred'));
      },
    });
  }, [locationId, updateFamilyLocation, router, t]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      padding: SPACING_MEDIUM,
      backgroundColor: theme.colors.errorContainer,
      marginBottom: SPACING_MEDIUM,
    },
    errorText: {
      color: theme.colors.onErrorContainer,
      textAlign: 'center',
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !familyLocation) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
          <Appbar.BackAction onPress={handleCancel} color={theme.colors.onSurface} />
          <Appbar.Content title={t('familyLocationForm.editTitle')} titleStyle={{ color: theme.colors.onSurface }} />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="bodyMedium" style={styles.errorText}>
            {t('common.error_occurred')}: {error?.message || t('familyLocation.errors.locationNotFound')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={handleCancel} color={theme.colors.onSurface} />
        <Appbar.Content title={t('familyLocationForm.editTitle')} titleStyle={{ color: theme.colors.onSurface }} />
      </Appbar.Header>
      <FamilyLocationForm initialValues={initialValues} onSubmit={handleUpdateFamilyLocation} isSubmitting={isSubmitting} />
    </View>
  );
}
