// gia-pha-viet-app/hooks/event/useUpdateEvent.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services';
import { EventFormData } from '@/utils/validation/eventValidationSchema';
import type { EventDto, UpdateEventRequestDto } from '@/types';
import { parseError } from '@/utils/errorUtils';
import { useTranslation } from 'react-i18next';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar';
import { eventQueryKeys } from './useEventsQuery'; // Import query keys
import { useRouter } from 'expo-router'; // Import useRouter
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore'; // Import useCurrentFamilyStore

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showSnackbar } = useGlobalSnackbar();
  const router = useRouter();
  const currentFamilyId = useCurrentFamilyStore((state) => state.currentFamilyId);

  return useMutation<EventDto | null, string, { id: string; formData: EventFormData }>({
    mutationFn: async ({ id, formData }: { id: string; formData: EventFormData }) => {
      if (!id) {
        throw new Error(t('eventForm.errors.noEventId'));
      }
      if (!currentFamilyId) {
        throw new Error(t('eventForm.errors.noFamilyId')); // Assuming a translation key for this
      }

      const updateRequest: UpdateEventRequestDto = {
        id: id,
        familyId: currentFamilyId,
        name: formData.name,
        code: formData.code,
        color: formData.color,
        description: formData.description,
        solarDate: formData.solarDate?.toISOString(),
        location: formData.location,
        type: formData.type,
        repeatRule: formData.repeatRule,
        calendarType: formData.calendarType,
        lunarDate: (formData.lunarDay && formData.lunarMonth) ? {
          day: formData.lunarDay,
          month: formData.lunarMonth,
          isLeapMonth: formData.isLeapMonth,
        } : undefined,
      };

      const result = await eventService.update(id, updateRequest);
      if (result.isSuccess) {
        return result.value ?? null;
      }
      throw parseError(result.error);
    },
    onSuccess: (data) => {
      showSnackbar(t('eventForm.updateSuccess'), 'success');
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.lists() });
      if (data) { // Only invalidate detail query if data is not null
        queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(data.id) });
      }
      router.back();
    },
    onError: (error) => {
      console.error('Error updating event:', error);
      showSnackbar(error, 'error');
    },
  });
};
