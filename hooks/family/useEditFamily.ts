import { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { familyService } from '@/services'; // Keep for now if update still uses it directly
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar';
import { useGetFamilyByIdQuery, useUpdateFamilyMutation } from '@/hooks/family/useFamilyQueries'; // Import react-query hooks
import { FamilyDetailDto, FamilyRole } from '@/types';
import { FamilyFormData } from '@/utils/validation/familyValidationSchema';
import { convertNullToUndefined } from '@/utils/typeUtils';

export const useEditFamily = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { showSnackbar } = useGlobalSnackbar();

  const familyId = Array.isArray(id) ? id[0] : id;

  const { data: initialFamilyData, isLoading: isLoadingInitialData, error: fetchErrorQuery } = useGetFamilyByIdQuery(familyId as string, !!familyId);
  const fetchError = fetchErrorQuery || null; // Map query error to string

  const { mutate: updateFamily, isPending: isSubmitting } = useUpdateFamilyMutation();

  const handleUpdateFamily = useCallback(async (data: FamilyFormData) => {
    if (!familyId) {
      showSnackbar(t('familyForm.errors.noFamilyId'), 'error');
      return;
    }
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

      await updateFamily({
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

      router.replace({ pathname: '/family/(tabs)/dashboard' as any, params: { id: familyId } });
    } catch (error: any) {
      console.error('Error updating family:', error);
      showSnackbar(error.message || t('familyForm.updateError'), 'error');
    }
  }, [familyId, router, showSnackbar, t, updateFamily]);

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