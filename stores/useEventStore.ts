import { create } from 'zustand';
import { eventService as defaultEventService } from '@/services';
import type { EventDto, SearchEventsQuery, GetUpcomingEventsQuery } from '@/types'; // Removed PaginatedList as it's part of GenericCrudStore
import { createGenericCrudStore, GenericCrudStore } from '@/stores/useGenericCrudStore'; // Import createGenericCrudStore
import { parseError } from '@/utils/errorUtils'; // Re-import parseError

const PAGE_SIZE = 10;

// Update EventStore type to extend GenericCrudStore and add specific actions
export type EventStore = GenericCrudStore<EventDto, EventDto, SearchEventsQuery, EventDto, EventDto> & {
  upcomingEvents: EventDto[];
  fetchUpcomingEvents: (query: GetUpcomingEventsQuery) => Promise<EventDto[] | null>;
};

export const useEventStore = create<EventStore>((set, get, api) => ({
  ...createGenericCrudStore<EventDto, EventDto, SearchEventsQuery, EventDto, EventDto>(
    defaultEventService,
    PAGE_SIZE
  )(set, get, api), // Initialize with generic CRUD store

  // Add specific event-related state and actions
  upcomingEvents: [],

  fetchUpcomingEvents: async (query: GetUpcomingEventsQuery): Promise<EventDto[] | null> => {
    set({ loading: true, error: null }); // Use generic loading/error
    try {
      const result = await defaultEventService.getUpcomingEvents(query); // Use defaultEventService directly
      if (result.isSuccess && result.value) {
        set({ upcomingEvents: result.value });
        return result.value;
      } else {
        const errorMessage = parseError(result.error);
        set({ error: errorMessage });
        return null;
      }
    } catch (err: any) {
      const errorMessage = parseError(err);
      set({ error: errorMessage });
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));