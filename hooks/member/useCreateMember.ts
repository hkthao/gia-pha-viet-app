import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useApiMutation } from '@/hooks/common/useApiMutation';
import { memberService } from '@/services';
import { MemberFormData } from '@/utils/validation/memberValidationSchema';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { useQueryClient } from '@tanstack/react-query';
import { MemberDetailDto } from '@/types'; // Import MemberDetailDto
import { convertNullToUndefined } from '@/utils/typeUtils'; // Import convertNullToUndefined

/**
 * Custom hook for creating a new member.
 * Handles the mutation, success/error feedback, and navigation.
 */
export const useCreateMember = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);

  const createMemberMutation = useApiMutation<MemberDetailDto, Error, MemberFormData>(
    async (formData: MemberFormData) => {
      if (!currentFamilyId) {
        throw new Error(t('memberForm.errors.noFamilyId'));
      }
      const dataToSubmit = { ...formData, familyId: currentFamilyId };
      const convertedData = convertNullToUndefined(dataToSubmit) as Partial<MemberDetailDto>;
      const result = await memberService.create(convertedData);
      if (result.isSuccess && result.value) { // Ensure value exists on success
        return result.value;
      }
      throw new Error(result.error?.message || t('memberForm.createError'));
    },
    {
      successMessageKey: 'memberForm.createSuccess',
      errorMessageKey: 'memberForm.createError',
      onSuccess: (newMember) => {
        queryClient.invalidateQueries({ queryKey: ['members', 'search'] });
        router.replace(`/member/${newMember.id}`);
      },
    }
  );

  return {
    createMember: createMemberMutation.mutateAsync, // Expose mutateAsync for direct await
    isCreatingMember: createMemberMutation.isPending,
  };
};