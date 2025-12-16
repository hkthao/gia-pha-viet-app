import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useApiMutation } from '@/hooks/common/useApiMutation';
import { memberService } from '@/services';
import { MemberFormData } from '@/utils/validation/memberValidationSchema';
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore';
import { useQueryClient } from '@tanstack/react-query';
import { MemberDetailDto, MemberCreateRequestDto } from '@/types'; // Import MemberDetailDto and MemberCreateRequestDto
import { convertNullToUndefined } from '@/utils/typeUtils'; // Import convertNullToUndefined

/**
 * Custom hook for creating a new member.
 * Handles the mutation, success/error feedback, and navigation.
 */
export const useCreateMember = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentFamilyId = useCurrentFamilyStore((state) => state.currentFamilyId);

  const createMemberMutation = useApiMutation<MemberDetailDto, Error, MemberFormData>(
    async (formData: MemberFormData) => {
      if (!currentFamilyId) {
        throw new Error(t('memberForm.errors.noFamilyId'));
      }
      const dataToSubmit: MemberCreateRequestDto = {
        ...formData,
        familyId: currentFamilyId,
        avatarBase64: formData.avatarBase64,
        dateOfBirth: formData.dateOfBirth instanceof Date ? formData.dateOfBirth.toISOString() : formData.dateOfBirth,
        dateOfDeath: formData.dateOfDeath instanceof Date ? formData.dateOfDeath.toISOString() : formData.dateOfDeath,
      };
      const result = await memberService.create(convertNullToUndefined(dataToSubmit) as MemberCreateRequestDto);
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