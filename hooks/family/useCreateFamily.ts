import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar';
import { useFamilyListStore } from '@/stores/useFamilyListStore';
import { familyService } from '@/services';
import { convertNullToUndefined } from '@/utils/typeUtils';
import { FamilyFormData } from '@/utils/validation/familyValidationSchema';

/**
 * Custom hook for creating a new family.
 * @returns An object containing the mutation function, loading state, and error state.
 */
export const useCreateFamily = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showSnackbar } = useGlobalSnackbar();
  const searchFamilyList = useFamilyListStore(state => state.search);

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (data: FamilyFormData) => {
      return familyService.create({
        name: data.name,
        description: convertNullToUndefined(data.description),
        address: convertNullToUndefined(data.address),
        avatarUrl: convertNullToUndefined(data.avatarUrl),
        visibility: data.visibility,
      });
    },
    onSuccess: (result) => {
      if (result.isSuccess) {
        showSnackbar(t('familyForm.createSuccess'), 'success');
        // Invalidate and refetch the family list to show the newly created family
        queryClient.invalidateQueries({ queryKey: ['familyList'] });
        searchFamilyList({ page: 1, itemsPerPage: 10, searchQuery: '' }, true); // Refresh family list
        router.replace('/(tabs)/search');
      } else {
        showSnackbar(result.error?.message || t('familyForm.createError'), 'error');
      }
    },
    onError: (error: any) => {
      console.error('Error creating family:', error);
      showSnackbar(error.message || t('familyForm.createError'), 'error');
    },
  });

  return { createFamily: mutate, isCreatingFamily: isPending, creationError: isError };
};
