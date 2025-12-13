import { useQuery } from '@tanstack/react-query';
import { memberService } from '@/services';
import { MemberDetailDto } from '@/types';
import { useTranslation } from 'react-i18next';

export const useMemberDetails = (memberId: string | undefined) => {
  const { t } = useTranslation();

  const {
    data: member,
    isLoading,
    error,
    isError,
    refetch,
  } = useQuery<MemberDetailDto, Error, MemberDetailDto>({
    queryKey: ['member', memberId],
    queryFn: async () => {
      if (!memberId) {
        throw new Error(t('memberDetail.errors.noMemberId'));
      }
      const result = await memberService.getById(memberId);
      if (result.isSuccess) {
        if (result.value === undefined) {
          throw new Error(t('memberDetail.errors.dataNotAvailable'));
        }
        return result.value;
      }
      throw new Error(result.error?.message || t('memberDetail.errors.fetchError'));
    },
    enabled: !!memberId, // Only run the query if memberId is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });

  return { member, isLoading, error: isError ? error : null, refetch };
};
