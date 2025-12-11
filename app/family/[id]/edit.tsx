import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Appbar, useTheme, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FamilyForm } from '@/components/family';
import { FamilyFormData } from '@/utils/validation/familyValidationSchema';
import { familyService } from '@/services';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar';
import { useFamilyListStore } from '@/stores/useFamilyListStore';
import type { FamilyDetailDto } from '@/types/family';
import { SPACING_MEDIUM } from '@/constants/dimensions'; // Added missing import
import { convertNullToUndefined } from '@/utils/typeUtils'; // Import helper function

export default function EditFamilyScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { showSnackbar } = useGlobalSnackbar();
  const searchFamilyList = useFamilyListStore(state => state.search); // Get search action to refresh list

  const familyId = Array.isArray(id) ? id[0] : id;

  const [initialFamilyData, setInitialFamilyData] = useState<FamilyDetailDto | undefined>(undefined);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFamilyDetails = async () => {
      if (!familyId) {
        setFetchError(t('familyForm.errors.noFamilyId'));
        setIsLoadingInitialData(false);
        return;
      }
      setIsLoadingInitialData(true);
      setFetchError(null);
      try {
        const result = await familyService.getById(familyId); // Changed to getById
        if (result.isSuccess && result.value) {
          setInitialFamilyData(result.value);
        } else {
          setFetchError(result.error?.message || t('familyForm.errors.fetchError'));
        }
      } catch (error: any) {
        setFetchError(error.message || t('familyForm.errors.fetchError'));
      } finally {
        setIsLoadingInitialData(false);
      }
    };

    fetchFamilyDetails();
  }, [familyId, t]);

  const handleUpdateFamily = useCallback(async (data: FamilyFormData) => {
    if (!familyId) {
      showSnackbar(t('familyForm.errors.noFamilyId'), 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await familyService.update(familyId, { // Changed to update
        name: data.name,
        description: convertNullToUndefined(data.description),
        address: convertNullToUndefined(data.address),
        avatarUrl: convertNullToUndefined(data.avatarUrl),
        visibility: data.visibility,
      });

      if (result.isSuccess) {
        showSnackbar(t('familyForm.updateSuccess'), 'success');
        searchFamilyList({ page: 1, itemsPerPage: 10, searchQuery: '' }, true); // Refresh family list
        router.replace({ pathname: '/family/[id]/dashboard' as any, params: { id: familyId } });
      } else {
        showSnackbar(result.error?.message || t('familyForm.updateError'), 'error');
      }
    } catch (error: any) {
      console.error('Error updating family:', error);
      showSnackbar(error.message || t('familyForm.updateError'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [familyId, router, showSnackbar, t, searchFamilyList]);

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
        <Appbar.Content title={t('familyForm.editTitle')} />
      </Appbar.Header>
      <FamilyForm
        initialValues={initialFamilyData}
        onSubmit={handleUpdateFamily}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </View>
  );
}
