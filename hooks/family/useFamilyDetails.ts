import { useQuery, useQueryClient } from '@tanstack/react-query'; // Removed useMutation
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { familyService } from '@/services';
import { useCurrentFamilyId } from './useCurrentFamilyId';
import { FamilyDetailDto } from '@/types';
import { usePermissionCheck } from '@/hooks/permissions/usePermissionCheck';
import { useMemo } from 'react';
import { useApiMutation } from '@/hooks/common/useApiMutation'; // Added useApiMutation

/**
 * @hook useFamilyDetails
 * @description Hook để lấy chi tiết gia đình hiện tại và cung cấp các hành động liên quan.
 *
 * @returns {object} Trả về đối tượng chứa thông tin chi tiết gia đình, trạng thái tải, lỗi, và các hành động.
 * @property {FamilyDetailDto | undefined} family - Đối tượng chi tiết gia đình.
 * @property {boolean} isLoading - Trạng thái đang tải dữ liệu.
 * @property {boolean} isError - Trạng thái có lỗi xảy ra.
 * @property {Error | null} error - Đối tượng lỗi nếu có.
 * @property {boolean} canEditOrDelete - Quyền chỉnh sửa hoặc xóa gia đình.
 * @property {() => void} handleEditFamily - Hàm xử lý chỉnh sửa gia đình.
 * @property {() => void} handleDeleteFamily - Hàm xử lý xóa gia đình.
 */
export function useFamilyDetails() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentFamilyId = useCurrentFamilyId();

  const {
    data: family,
    isLoading,
    isError,
    error,
  } = useQuery<FamilyDetailDto, Error>({
    queryKey: ['family', currentFamilyId],
    queryFn: async (): Promise<FamilyDetailDto> => {
      if (!currentFamilyId) {
        throw new Error(t('familyDetail.errors.noFamilyId'));
      }
      const result = await familyService.getById(currentFamilyId);
      if (result.isSuccess) {
        return result.value as FamilyDetailDto;
      } else {
        throw new Error(result.error?.message || t('familyDetail.errors.fetchError'));
      }
    },
    enabled: !!currentFamilyId,
  });

  const { canManageFamily, isAdmin } = usePermissionCheck(family?.id);

  const canEditOrDelete = useMemo(() => {
    return canManageFamily || isAdmin;
  }, [canManageFamily, isAdmin]);

  const handleEditFamily = () => {
    if (family?.id) {
      router.push(`/family/create?id=${family.id}`);
    }
  };

  // Mutation for deleting a family
  const deleteFamilyMutation = useApiMutation<void, Error, string>( // Use useApiMutation
    async (familyId: string) => {
      const result = await familyService.delete(familyId);
      if (!result.isSuccess) {
        throw new Error(result.error?.message || t('familyDetail.delete.errorMessage'));
      }
      return result.value;
    },
    {
      successMessageKey: 'familyDetail.delete.successMessage',
      errorMessageKey: 'familyDetail.delete.errorMessage',
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['family', currentFamilyId] });
        queryClient.invalidateQueries({ queryKey: ['familyList'] }); // Invalidate family list as well
        router.back();
      },
    }
  );

  const handleDeleteFamily = () => {
    if (family?.id) {
      Alert.alert(
        t('familyDetail.delete.confirmTitle'),
        t('familyDetail.delete.confirmMessage', { familyName: family.name }),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
            onPress: () => {}, // Do nothing on cancel
          },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () => deleteFamilyMutation.mutate(family.id), // Trigger mutation
          },
        ],
        { cancelable: true }
      );
    }
  };

  return { family, isLoading, isError, error, canEditOrDelete, handleEditFamily, handleDeleteFamily };
}
