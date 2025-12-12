import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query'; // Keep useQueryClient for invalidation
import { useApiMutation } from '@/hooks/common/useApiMutation'; // Import the new hook
import { useFamilyListStore } from '@/stores/useFamilyListStore';
import { familyService } from '@/services';
import { convertNullToUndefined } from '@/utils/typeUtils';
import { FamilyFormData } from '@/utils/validation/familyValidationSchema';
import { FamilyDetailDto } from '@/types'; // Import FamilyDetailDto for onSuccess result type

/**
 * Custom hook for creating a new family.
 * @returns An object containing the mutation function, loading state, and error state.
 */
export const useCreateFamily = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchFamilyList = useFamilyListStore(state => state.search);

  const { mutate, isPending, isError } = useApiMutation<FamilyDetailDto, Error, FamilyFormData>(
    async (data: FamilyFormData) => {
      const result = await familyService.create({
        name: data.name,
        description: convertNullToUndefined(data.description),
        address: convertNullToUndefined(data.address),
        avatarUrl: convertNullToUndefined(data.avatarUrl),
        visibility: data.visibility,
      });
      if (result.isSuccess) {
        return result.value as FamilyDetailDto;
      }
      throw new Error(result.error?.message || t('familyForm.createError'));
    },
    {
      successMessageKey: 'familyForm.createSuccess',
      errorMessageKey: 'familyForm.createError',
      onSuccess: () => {
        // Invalidate and refetch the family list to show the newly created family
        queryClient.invalidateQueries({ queryKey: ['familyList'] });
        searchFamilyList({ page: 1, itemsPerPage: 10, searchQuery: '' }, true); // Refresh family list
        router.replace('/(tabs)/search');
      },
    }
  );

  return { createFamily: mutate, isCreatingFamily: isPending, creationError: isError };
};
