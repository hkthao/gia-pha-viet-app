import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { FamilyForm } from '@/components/family';
import { FamilyFormData } from '@/utils/validation/familyValidationSchema';
import { familyService } from '@/services';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar';
import { useFamilyListStore } from '@/stores/useFamilyListStore'; // To invalidate cache
import { convertNullToUndefined } from '@/utils/typeUtils'; // Import helper function

export default function CreateFamilyScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { showSnackbar } = useGlobalSnackbar();
  const searchFamilyList = useFamilyListStore(state => state.search); // Get search action to refresh list

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateFamily = useCallback(async (data: FamilyFormData) => {
    setIsSubmitting(true);
    try {
      const result = await familyService.create({ // Use familyService.create
        name: data.name,
        description: convertNullToUndefined(data.description),
        address: convertNullToUndefined(data.address),
        avatarUrl: convertNullToUndefined(data.avatarUrl),
        visibility: data.visibility,
      });

      if (result.isSuccess) {
        showSnackbar(t('familyForm.createSuccess'), 'success');
        searchFamilyList({ page: 1, itemsPerPage: 10, searchQuery: '' }, true); // Refresh family list
        router.replace('/(tabs)/search');
      } else {
        showSnackbar(result.error?.message || t('familyForm.createError'), 'error');
      }
    } catch (error: any) {
      console.error('Error creating family:', error);
      showSnackbar(error.message || t('familyForm.createError'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [router, showSnackbar, t, searchFamilyList]);

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
      <Appbar.Header>
        <Appbar.BackAction onPress={handleCancel} />
        <Appbar.Content title={t('familyForm.createTitle')} />
      </Appbar.Header>
      <FamilyForm
        onSubmit={handleCreateFamily}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </View>
  );
}
