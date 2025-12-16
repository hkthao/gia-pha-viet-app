// gia-pha-viet-app/hooks/event/useUpdateEvent.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services';
import { EventFormData } from '@/utils/validation/eventValidationSchema';
import type { EventDto, UpdateEventRequestDto } from '@/types';
import { parseError } from '@/utils/errorUtils';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar';
import { eventQueryKeys } from './useEventsQuery'; // Import query keys
import { useRouter } from 'expo-router'; // Import useRouter

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showSnackbar } = useGlobalSnackbar();
  const router = useRouter();

  return useMutation<EventDto, string, { id: string; formData: EventFormData }>({
    mutationFn: async ({ id, formData }: { id: string; formData: EventFormData }) => {
      if (!id) {
        throw new Error(t('eventForm.errors.noEventId'));
      }

      const updateRequest: UpdateEventRequestDto = {
        id: id,
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
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(parseError(result.error));
    },
    onSuccess: (data) => {
      showSnackbar(t('eventForm.updateSuccess'), 'success');
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(data.id) });
      router.back();
    },
    onError: (error) => {
      console.error('Error updating event:', error);
      showSnackbar(error, 'error');
    },
  });
};
