import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { UserListDto } from '@/types';
import { FamilyRole, FamilyUserDto } from '@/types';
import { userService } from '@/services';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { FamilyFormData } from '@/utils/validation/familyValidationSchema';

interface UseFamilyUserManagementProps {
  initialFamilyId?: string;
  setValue: UseFormSetValue<FamilyFormData>;
  watch: UseFormWatch<FamilyFormData>;
}

export const useFamilyUserManagement = ({ initialFamilyId, setValue, watch }: UseFamilyUserManagementProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const rawFamilyUsers = watch('familyUsers');
  const familyUsers = useMemo(() => rawFamilyUsers || [], [rawFamilyUsers]);

  const allUserIds = familyUsers.map(fu => fu.userId);

  const { data: fetchedFamilyUserDetails } = useQuery<UserListDto[], Error, UserListDto[], [string, { userIds: string[] }]>({
    queryKey: ['familyUserDetails', { userIds: allUserIds }],
    queryFn: async ({ queryKey }) => {
      const [, { userIds: idsToFetch }] = queryKey;
      if (!idsToFetch || idsToFetch.length === 0) {
        return [];
      }
      const result = await userService.getByIds(idsToFetch);
      return result;
    },
    enabled: allUserIds.length > 0,
  });

  const managers = useMemo(() => {
    if (!fetchedFamilyUserDetails) {
      return [];
    }
    const mgrs = familyUsers
      .filter(fu => fu.role === FamilyRole.Manager)
      .map(fu => {
        const userDetail = fetchedFamilyUserDetails.find(detail => detail.id === fu.userId);
        return {
          id: fu.userId,
          name: userDetail?.name || fu.userName || '',
          email: userDetail?.email || '',
        };
      });
    return mgrs;
  }, [familyUsers, fetchedFamilyUserDetails]);

  const viewers = useMemo(() => {
    if (!fetchedFamilyUserDetails) {
      return [];
    }
    const vwrs = familyUsers
      .filter(fu => fu.role === FamilyRole.Viewer)
      .map(fu => {
        const userDetail = fetchedFamilyUserDetails.find(detail => detail.id === fu.userId);
        return {
          id: fu.userId,
          name: userDetail?.name || fu.userName || '',
          email: userDetail?.email || '',
        };
      });
    return vwrs;
  }, [familyUsers, fetchedFamilyUserDetails]);

  const handleManagersChanged = useCallback((managerIds: string[]) => {
    const newManagersWithDetails = managerIds.map(userId => {
      const userDetail = fetchedFamilyUserDetails?.find(detail => detail.id === userId);
      return {
        familyId: initialFamilyId,
        userId: userId,
        userName: userDetail?.name || '',
        email: userDetail?.email || '',
        role: FamilyRole.Manager,
      } as FamilyUserDto; // Cast to FamilyUserDto
    });

    const currentViewers = familyUsers.filter(fu => fu.role === FamilyRole.Viewer);
    const updatedFamilyUsers = [...newManagersWithDetails, ...currentViewers];
    setValue('familyUsers', updatedFamilyUsers, { shouldValidate: true });
    queryClient.invalidateQueries({ queryKey: ['familyUserDetails'] });
  }, [initialFamilyId, familyUsers, setValue, fetchedFamilyUserDetails, queryClient]);

  const handleViewersChanged = useCallback((viewerIds: string[]) => {
    const newViewersWithDetails = viewerIds.map(userId => {
      const userDetail = fetchedFamilyUserDetails?.find(detail => detail.id === userId);
      return {
        familyId: initialFamilyId,
        userId: userId,
        userName: userDetail?.name || '',
        email: userDetail?.email || '',
        role: FamilyRole.Viewer,
      } as FamilyUserDto; // Cast to FamilyUserDto
    });

    const currentManagers = familyUsers.filter(fu => fu.role === FamilyRole.Manager);
    const updatedFamilyUsers = [...currentManagers, ...newViewersWithDetails];
    setValue('familyUsers', updatedFamilyUsers, { shouldValidate: true });
    queryClient.invalidateQueries({ queryKey: ['familyUserDetails'] });
  }, [initialFamilyId, familyUsers, setValue, fetchedFamilyUserDetails, queryClient]);

  return {
    managers,
    viewers,
    handleManagersChanged,
    handleViewersChanged,
  };
};
