import { useQuery } from '@tanstack/react-query';
import { eventService } from '@/services';
import { useTranslation } from 'react-i18next';
import { EventDto } from '@/types';
import { EventFormData, EventFormCalendarType, EventFormRepeatRule } from '@/utils/validation/eventValidationSchema';

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
      code: '', // Assuming EventDto doesn't have code, defaulting for form
      color: '', // Assuming EventDto doesn't have color, defaulting for form
      description: data.description || '',
      solarDate: data.startDate ? new Date(data.startDate) : undefined, // Renamed from startDate
      location: data.location || '',
      type: data.type,
      repeatRule: EventFormRepeatRule.NONE, // Default for now, or derive from EventDto if possible
      calendarType: EventFormCalendarType.SOLAR, // Default for now, or derive from EventDto if possible
      lunarDay: undefined,
      lunarMonth: undefined,
      isLeapMonth: false,
    }),
  });

  return { event, isLoading, isError, error };
};
