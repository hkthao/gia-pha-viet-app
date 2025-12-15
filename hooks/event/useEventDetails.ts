import { useQuery } from '@tanstack/react-query';
import { eventService } from '@/services';
import { useTranslation } from 'react-i18next';
import { EventDto } from '@/types';
import { EventFormData } from '@/utils/validation/eventValidationSchema';

export const useEventDetails = (eventId: string | undefined) => {
  const { t } = useTranslation();

  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useQuery<EventDto, Error, EventFormData>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!eventId) {
        throw new Error(t('eventForm.errors.noEventId'));
      }
      const result = await eventService.getById(eventId);
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(result.error?.message || t('eventForm.errors.fetchError'));
    },
    enabled: !!eventId, // Only run query if eventId is available
    select: (data): EventFormData => ({
      // Map EventDto to EventFormData
      name: data.name || '',
      description: data.description || '',
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      location: data.location || '',
      type: data.type,
      repeatAnnually: false, // Assuming this is not stored in EventDto or needs to be derived
      isLunarDate: false, // Assuming this is not stored in EventDto or needs to be derived
      lunarDay: undefined,
      lunarMonth: undefined,
      isLeapMonth: false,
    }),
  });

  return { event, isLoading, isError, error };
};
