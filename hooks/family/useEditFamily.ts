import { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { familyService } from '@/services';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar';
import { useFamilyListStore } from '@/stores/useFamilyListStore';
import { FamilyDetailDto, FamilyRole } from '@/types';
import { FamilyFormData } from '@/utils/validation/familyValidationSchema';
import { convertNullToUndefined } from '@/utils/typeUtils';

export const useEditFamily = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { showSnackbar } = useGlobalSnackbar();
  const searchFamilyList = useFamilyListStore(state => state.search);

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
        const result = await familyService.getById(familyId);
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
      const familyUsers = [
        ...(data.managerIds || []).map(id => ({
          userId: id,
          role: FamilyRole.Manager,
        })),
        ...(data.viewerIds || []).map(id => ({
          userId: id,
          role: FamilyRole.Viewer,
        })),
      ];

      const result = await familyService.update(familyId, {
        id: familyId,
        name: data.name,
        description: convertNullToUndefined(data.description),
        code: convertNullToUndefined(data.code),
        address: convertNullToUndefined(data.address),
        avatarUrl: convertNullToUndefined(data.avatarUrl),
        avatarBase64: convertNullToUndefined(data.avatarBase64),
        visibility: data.visibility,
        familyUsers: familyUsers,
      });

      if (result.isSuccess) {
        showSnackbar(t('familyForm.updateSuccess'), 'success');
        searchFamilyList({ page: 1, itemsPerPage: 10, searchQuery: '' }, true);
        router.replace({ pathname: '/family/(tabs)/dashboard' as any, params: { id: familyId } });
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

  return {
    familyId,
    initialFamilyData,
    isLoadingInitialData,
    fetchError,
    isSubmitting,
    handleUpdateFamily,
    handleCancel,
  };
};