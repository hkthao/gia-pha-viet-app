// gia-pha-viet-app/hooks/member/useMemberQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberService } from '@/services';
import type { MemberListDto, SearchMembersQuery, MemberDetailDto, MemberCreateRequestDto, MemberUpdateRequestDto } from '@/types';
import { parseError } from '@/utils/errorUtils';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

export const memberQueryKeys = {
  all: ['members'] as const,
  lists: () => [...memberQueryKeys.all, 'list'] as const,
  list: (filters: SearchMembersQuery) => [...memberQueryKeys.lists(), { filters }] as const,
  details: () => [...memberQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...memberQueryKeys.details(), id] as const,
};

// Hook for searching members (list operation)
export const useSearchMembersQuery = (filters: SearchMembersQuery) => {
  return useQuery<MemberListDto[], string>({
    queryKey: memberQueryKeys.list(filters),
    queryFn: async () => {
      const result = await memberService.search(filters);
      if (result.isSuccess && result.value) {
        return result.value.items; // Assuming search returns PaginatedList<MemberListDto>
      }
      throw new Error(parseError(result.error));
    },
    enabled: !!filters.familyId, // Only run the query if familyId is provided
  });
};

// Hook for getting a single member by ID
export const useGetMemberByIdQuery = (id: string, enabled: boolean = true) => {
  return useQuery<MemberDetailDto, string>({
    queryKey: memberQueryKeys.detail(id),
    queryFn: async () => {
      const result = await memberService.getById(id);
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(parseError(result.error));
    },
    enabled: !!id && enabled,
  });
};

// Hook for creating a member
export const useCreateMemberMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation<MemberDetailDto, string, MemberCreateRequestDto>({
    mutationFn: async (newMember) => {
      const result = await memberService.create(newMember);
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(parseError(result.error));
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.detail(data.id) });
      Alert.alert(t('common.success'), t('member.createSuccess'));
    },
    onError: (error) => {
      Alert.alert(t('common.error'), error);
    },
  });
};

// Hook for updating a member
export const useUpdateMemberMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation<MemberDetailDto, string, MemberUpdateRequestDto>({
    mutationFn: async (updatedMember) => {
      if (!updatedMember.id) {
        throw new Error(t('member.idRequiredForUpdate'));
      }
      const result = await memberService.update(updatedMember.id, updatedMember);
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(parseError(result.error));
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.detail(data.id) });
      Alert.alert(t('common.success'), t('member.updateSuccess'));
    },
    onError: (error) => {
      Alert.alert(t('common.error'), error);
    },
  });
};

// Hook for deleting a member
export const useDeleteMemberMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation<boolean, string, string>({
    mutationFn: async (id) => {
      const result = await memberService.delete(id);
      if (result.isSuccess) {
        return true;
      }
      throw new Error(parseError(result.error));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.lists() });
      Alert.alert(t('common.success'), t('member.deleteSuccess'));
    },
    onError: (error) => {
      Alert.alert(t('common.error'), error);
    },
  });
};
