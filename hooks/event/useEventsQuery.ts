// gia-pha-viet-app/hooks/event/useEventsQuery.ts
import { useQuery } from '@tanstack/react-query';
import { eventService } from '@/services';
import type { SearchEventsQuery, GetUpcomingEventsQuery, EventDto } from '@/types';
import { parseError } from '@/utils/errorUtils';

export const eventQueryKeys = {
  all: ['events'] as const,
  lists: () => [...eventQueryKeys.all, 'list'] as const,
  list: (filters: SearchEventsQuery) => [...eventQueryKeys.lists(), { filters }] as const,
  upcoming: (filters: GetUpcomingEventsQuery) => [...eventQueryKeys.all, 'upcoming', { filters }] as const,
  details: () => [...eventQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventQueryKeys.details(), id] as const,
};

export const useSearchEventsQuery = (filters: SearchEventsQuery) => {
  return useQuery<EventDto[], string>({
    queryKey: eventQueryKeys.list(filters),
    queryFn: async () => {
      const result = await eventService.search(filters);
      if (result.isSuccess && result.value) {
        return result.value.items; // Assuming search returns PaginatedList<EventDto>
      }
      throw new Error(parseError(result.error));
    },
  });
};

export const useGetUpcomingEventsQuery = (query: GetUpcomingEventsQuery) => {
  return useQuery<EventDto[], string>({
    queryKey: eventQueryKeys.upcoming(query),
    queryFn: async () => {
      const result = await eventService.getUpcomingEvents(query);
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(parseError(result.error));
    },
  });
};
