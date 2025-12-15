import { useQuery } from '@tanstack/react-query';
import { eventService } from '@/services';
import { useTranslation } from 'react-i18next';
import { EventDto } from '@/types';

export const useEventDetails = (eventIdParam: string | string[] | undefined) => {
  const { t } = useTranslation();

  const eventId = Array.isArray(eventIdParam) ? eventIdParam[0] : eventIdParam;

  const queryResult = useQuery<EventDto, Error, EventDto>({
    queryKey: ['event', eventId],
    queryFn: async (): Promise<EventDto> => {
      if (!eventId) {
        throw new Error(t('eventDetail.errors.noEventId'));
      }
      const result = await eventService.getById(eventId);
      if (result.isSuccess) {
        return result.value as EventDto;
      } else {
        throw new Error(result.error?.message || t('eventDetail.errors.fetchError'));
      }
    },
    enabled: !!eventId, // Only run query if eventId is available
  });

  return {
    event: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
};