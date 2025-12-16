// gia-pha-viet-app/hooks/family/useFamilyQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { familyService } from '@/services';
import type { FamilyListDto, SearchFamiliesQuery, FamilyDetailDto, FamilyCreateRequestDto, FamilyUpdateRequestDto, FamilyUserDto } from '@/types';
import { parseError } from '@/utils/errorUtils';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

export const familyQueryKeys = {
  all: ['families'] as const,
  lists: () => [...familyQueryKeys.all, 'list'] as const,
  list: (filters: SearchFamiliesQuery) => [...familyQueryKeys.lists(), { filters }] as const,
  details: () => [...familyQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...familyQueryKeys.details(), id] as const,
  myAccess: () => [...familyQueryKeys.all, 'myAccess'] as const,
};

// Hook for searching families (list operation)
export const useSearchFamiliesQuery = (filters: SearchFamiliesQuery) => {
  return useQuery<FamilyListDto[], string>({
    queryKey: familyQueryKeys.list(filters),
    queryFn: async () => {
      const result = await familyService.search(filters);
      if (result.isSuccess && result.value) {
        return result.value.items; // Assuming search returns PaginatedList<FamilyListDto>
      }
      throw new Error(parseError(result.error));
    },
  });
};

// Hook for getting a single family by ID
export const useGetFamilyByIdQuery = (id: string, enabled: boolean = true) => {
  return useQuery<FamilyDetailDto, string>({
    queryKey: familyQueryKeys.detail(id),
    queryFn: async () => {
      const result = await familyService.getById(id);
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(parseError(result.error));
    },
    enabled: !!id && enabled,
  });
};

// Hook for getting families the current user has access to
export const useGetMyAccessFamiliesQuery = () => {
  return useQuery<FamilyUserDto[], string>({
    queryKey: familyQueryKeys.myAccess(),
    queryFn: async () => {
      const result = await familyService.getMyAccess();
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(parseError(result.error));
    },
  });
};

// Hook for creating a family
export const useCreateFamilyMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation<FamilyDetailDto, string, FamilyCreateRequestDto>({
    mutationFn: async (newFamily) => {
      const result = await familyService.create(newFamily);
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(parseError(result.error));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.myAccess() });
      Alert.alert(t('common.success'), t('family.createSuccess'));
    },
    onError: (error) => {
      Alert.alert(t('common.error'), error);
    },
  });
};

// Hook for updating a family
export const useUpdateFamilyMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation<FamilyDetailDto, string, FamilyUpdateRequestDto>({
    mutationFn: async (updatedFamily) => {
      if (!updatedFamily.id) {
        throw new Error(t('family.idRequiredForUpdate'));
      }
      const result = await familyService.update(updatedFamily.id, updatedFamily);
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(parseError(result.error));
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.detail(data.id) });
      Alert.alert(t('common.success'), t('family.updateSuccess'));
    },
    onError: (error) => {
      Alert.alert(t('common.error'), error);
    },
  });
};

// Hook for deleting a family
export const useDeleteFamilyMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation<boolean, string, string>({
    mutationFn: async (id) => {
      const result = await familyService.delete(id);
      if (result.isSuccess) {
        return true;
      }
      throw new Error(parseError(result.error));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: familyQueryKeys.myAccess() });
      Alert.alert(t('common.success'), t('family.deleteSuccess'));
    },
    onError: (error) => {
      Alert.alert(t('common.error'), error);
    },
  });
};
