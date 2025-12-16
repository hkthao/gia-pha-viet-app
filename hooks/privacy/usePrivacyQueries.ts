// gia-pha-viet-app/hooks/privacy/usePrivacyQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { privacyService } from '@/services';
import type { PrivacyConfigurationDto, UpdatePrivacyConfigurationCommand } from '@/types/privacy';
import { parseError } from '@/utils/errorUtils';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

export const privacyQueryKeys = {
  all: ['privacy'] as const,
  detail: (familyId: string) => [...privacyQueryKeys.all, familyId] as const,
};

export const useGetPrivacyConfigurationQuery = (familyId: string) => {
  return useQuery<PrivacyConfigurationDto | null, string>({
    queryKey: privacyQueryKeys.detail(familyId),
    queryFn: async () => {
      const result = await privacyService.get(familyId);
      if (result.isSuccess) {
        return result.value ?? null;
      }
      throw new Error(parseError(result.error));
    },
    enabled: !!familyId,
  });
};

export const useUpdatePrivacyConfigurationMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation<PrivacyConfigurationDto | null, string, UpdatePrivacyConfigurationCommand>({
    mutationFn: async (command) => {
      const result = await privacyService.update(command);
      if (result.isSuccess) {
        return result.value ?? null;
      }
      throw new Error(parseError(result.error));
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: privacyQueryKeys.detail(variables.familyId) });
      Alert.alert(t('common.success'), t('privacy.updateSuccess'));
    },
    onError: (error) => {
      Alert.alert(t('common.error'), error);
    },
  });
};