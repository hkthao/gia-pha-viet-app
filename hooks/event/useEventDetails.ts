import { useQuery } from '@tanstack/react-query';
import { eventService } from '@/services';
import { useTranslation } from 'react-i18next';
import { EventDto } from '@/types';
// Removed unused EventFormData imports

export const useEventDetails = (eventId: string | undefined) => {
  const { t } = useTranslation();

  const {
    data: event, // 'event' will now be of type EventDto directly
    isLoading,
    isError,
    error,
  } = useQuery<EventDto, Error>({ // No TData generic for EventFormData
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
    // Removed select function, as we want to return EventDto directly
  });

  return { event, isLoading, isError, error };
};
