import { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { memberService } from '@/services';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar';
import { MemberFormData } from '@/utils/validation/memberValidationSchema';
import type { MemberDetailDto, MemberUpdateRequestDto } from '@/types';
import { useApiMutation } from '@/hooks/common/useApiMutation';
import { useQueryClient } from '@tanstack/react-query';
import { convertNullToUndefined } from '@/utils/typeUtils'; // Import convertNullToUndefined

export const useEditMemberForm = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { showSnackbar } = useGlobalSnackbar();
  const queryClient = useQueryClient();

  const memberId = Array.isArray(id) ? id[0] : id;

  const [initialMemberData, setInitialMemberData] = useState<MemberDetailDto | undefined>(undefined);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      if (!memberId) {
        setFetchError(t('memberForm.errors.noMemberId')); // Need to add this translation key
        setIsLoadingInitialData(false);
        return;
      }
      setIsLoadingInitialData(true);
      setFetchError(null);
      try {
        const result = await memberService.getById(memberId);
        if (result.isSuccess && result.value) {
          setInitialMemberData(result.value);
        } else {
          setFetchError(result.error?.message || t('memberForm.errors.fetchError')); // Need to add this translation key
        }
      } catch (error: any) {
        setFetchError(error.message || t('memberForm.errors.fetchError'));
      } finally {
        setIsLoadingInitialData(false);
      }
    };

    fetchMemberDetails();
  }, [memberId, t]);

  const updateMemberMutation = useApiMutation<void, Error, MemberFormData>(
    async (formData: MemberFormData) => {
      if (!memberId) {
        throw new Error(t('memberForm.errors.noMemberId'));
      }
      const dataToSubmit: MemberUpdateRequestDto = {
        id: memberId,
        ...formData,
        avatarBase64: formData.avatarBase64,
        dateOfBirth: formData.dateOfBirth instanceof Date ? formData.dateOfBirth.toISOString() : formData.dateOfBirth,
        dateOfDeath: formData.dateOfDeath instanceof Date ? formData.dateOfDeath.toISOString() : formData.dateOfDeath,
      }
      const result = await memberService.update(memberId, convertNullToUndefined(dataToSubmit) as MemberUpdateRequestDto);
      if (result.isSuccess) {
        return; // Return void as the onSuccess callback does not use the returned data
      }
      throw new Error(result.error?.message || t('memberForm.updateError'));
    },
    {
      successMessageKey: 'memberForm.updateSuccess',
      errorMessageKey: 'memberForm.updateError',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['member', memberId] });
        queryClient.invalidateQueries({ queryKey: ['members', 'search'] });
        router.back(); // Navigate back after successful update
      },
    }
  );

  const handleUpdateMember = useCallback(async (data: MemberFormData) => {
    await updateMemberMutation.mutateAsync(data);
  }, [updateMemberMutation]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return {
    memberId,
    initialMemberData,
    isLoadingInitialData,
    fetchError,
    isSubmitting: updateMemberMutation.isPending,
    handleUpdateMember,
    handleCancel,
  };
};
