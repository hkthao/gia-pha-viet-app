
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query'; // Keep useQueryClient for invalidation
import { useApiMutation } from '@/hooks/common/useApiMutation'; // Import the new hook
import { familyService } from '@/services';
import { convertNullToUndefined } from '@/utils/typeUtils';
import { FamilyFormData } from '@/utils/validation/familyValidationSchema';
import { FamilyDetailDto, FamilyRole } from '@/types'; // Import FamilyDetailDto for onSuccess result type

/**
 * Custom hook for creating a new family.
 * @returns An object containing the mutation function, loading state, and error state.
 */
export const useCreateFamily = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate, isPending, isError } = useApiMutation<FamilyDetailDto, Error, FamilyFormData>(
    async (data: FamilyFormData) => {
      // Transform managerIds and viewerIds into FamilyUserDto[]
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

      const result = await familyService.create({
        name: data.name,
        description: convertNullToUndefined(data.description),
        address: convertNullToUndefined(data.address),
        avatarUrl: convertNullToUndefined(data.avatarUrl),
        avatarBase64: convertNullToUndefined(data.avatarBase64),
        visibility: data.visibility,
        familyUsers: familyUsers, // Pass the transformed familyUsers
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
        router.replace('/(tabs)/search');
      },
    }
  );

  return { createFamily: mutate, isCreatingFamily: isPending, creationError: isError };
};
