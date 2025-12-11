import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native'; // Added
import { useRouter } from 'expo-router'; // Added
import { useTheme } from 'react-native-paper'; // Added
import { familyService } from '@/services';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { FamilyDetailDto } from '@/types';
import { usePermissionCheck } from '@/hooks/permissions/usePermissionCheck'; // Added
import { useMemo } from 'react'; // Added

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
  const theme = useTheme(); // Added
  const router = useRouter(); // Added
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);

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

  const { canManageFamily, isAdmin } = usePermissionCheck(family?.id); // Use the existing permission hook

  const canEditOrDelete = useMemo(() => {
    return canManageFamily || isAdmin;
  }, [canManageFamily, isAdmin]);

  const handleEditFamily = () => {
    if (family?.id) {
      router.push(`/family/create?id=${family.id}`);
    }
  };

  const handleDeleteFamily = () => {
    if (family?.id) {
      Alert.alert(
        t('familyDetail.delete.confirmTitle'),
        t('familyDetail.delete.confirmMessage', { familyName: family.name }),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () => {
              // TODO: Implement actual delete API call
              console.log(`Deleting family with ID: ${family.id}`);
              Alert.alert(t('familyDetail.delete.successTitle'), t('familyDetail.delete.successMessage'));
              router.back();
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  return { family, isLoading, isError, error, canEditOrDelete, handleEditFamily, handleDeleteFamily };
}