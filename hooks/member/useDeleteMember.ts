import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiMemberService } from '@/services/member/api.member.service';
import { memberService } from '@/services/index';
import { IMemberService } from '@/services/member/member.service.interface';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Result as IResultType } from '@/types'; // Import the Result interface as IResultType

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useGlobalSnackbar();
  const { t } = useTranslation();
  const router = useRouter();

  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationFn: async (memberId: string) => {
      // Ép kiểu `memberService` về `IMemberService` để TypeScript nhận diện phương thức `delete`
      const service = memberService as IMemberService;
      const result: IResultType<void> = await service.delete(memberId);
      if (!result.isSuccess) {
        throw new Error(result.error?.message || t('common.unknown_error'));
      }
      return result.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['memberDetails'] });
      showSnackbar(t('memberDetail.deleteSuccess'));
      router.back(); 
    },
    onError: (err) => {
      showSnackbar(t('memberDetail.deleteError') + `: ${err.message}`);
    },
  });

  return { deleteMember: mutate, isDeleting: isPending, isDeleteError: isError, isDeleteSuccess: isSuccess, deleteError: error };
};
