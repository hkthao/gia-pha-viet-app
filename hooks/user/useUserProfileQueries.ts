// gia-pha-viet-app/hooks/user/useUserProfileQueries.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { userProfileService } from '@/services';
import type { UserProfileDto } from '@/types/userProfile';
import { parseError } from '@/utils/errorUtils';

export const userProfileQueryKeys = {
  all: ['userProfile'] as const,
  current: () => [...userProfileQueryKeys.all, 'current'] as const,
};

export const useGetCurrentUserProfileQuery = (options?: UseQueryOptions<UserProfileDto, string>) => {
  return useQuery<UserProfileDto, string>({
    queryKey: userProfileQueryKeys.current(),
    queryFn: async () => {
      const result = await userProfileService.getCurrentUserProfile();
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(parseError(result.error));
    },
    ...options,
  });
};
