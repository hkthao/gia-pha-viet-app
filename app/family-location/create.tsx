import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router'; // Import useLocalSearchParams
import { useTranslation } from 'react-i18next';
import { FamilyLocationForm } from '@/components/familyLocation';
import { FamilyLocationFormData } from '@/utils/validation/familyLocationValidationSchema';
import { useCreateFamilyLocation } from '@/hooks/familyLocation/useFamilyLocationQueries';
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore';
import { LocationType } from '@/types'; // Import LocationType enum

export default function CreateFamilyLocationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { currentFamilyId } = useCurrentFamilyStore();
  const { mutate: createFamilyLocation, isPending: isSubmitting } = useCreateFamilyLocation();

  // Extract initial data from URL params
  const {
    name,
    description,
    latitude,
    longitude,
    address,
    locationType,
  } = useLocalSearchParams();

  const initialFormValues = useMemo(() => {
    return {
      name: typeof name === 'string' ? name : undefined,
      description: typeof description === 'string' ? description : undefined,
      latitude: typeof latitude === 'string' ? parseFloat(latitude) : undefined,
      longitude: typeof longitude === 'string' ? parseFloat(longitude) : undefined,
      address: typeof address === 'string' ? address : undefined,
      locationType: typeof locationType === 'string' && Object.values(LocationType).includes(parseInt(locationType, 10))
        ? parseInt(locationType, 10) as LocationType
        : LocationType.Other, // Default or undefined
      familyId: currentFamilyId || undefined, // Ensure familyId is passed if available
    };
  }, [name, description, latitude, longitude, address, locationType, currentFamilyId]);


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
      <FamilyLocationForm
        onSubmit={handleCreateFamilyLocation}
        isSubmitting={isSubmitting}
        initialValues={initialFormValues}
      />
    </View>
  );
}
