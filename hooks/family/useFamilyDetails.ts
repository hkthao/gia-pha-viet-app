import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { familyService } from '@/services';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { FamilyDetailDto } from '@/types';

/**
 * @hook useFamilyDetails
 * @description Hook để lấy chi tiết gia đình hiện tại.
 *
 * @returns {object} Trả về đối tượng chứa thông tin chi tiết gia đình, trạng thái tải, lỗi.
 * @property {FamilyDetailDto | undefined} family - Đối tượng chi tiết gia đình.
 * @property {boolean} isLoading - Trạng thái đang tải dữ liệu.
 * @property {boolean} isError - Trạng thái có lỗi xảy ra.
 * @property {Error | null} error - Đối tượng lỗi nếu có.
 */
export function useFamilyDetails() {
  const { t } = useTranslation();
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
    enabled: !!currentFamilyId, // Chỉ chạy query khi currentFamilyId có giá trị
  });

  return { family, isLoading, isError, error };
}