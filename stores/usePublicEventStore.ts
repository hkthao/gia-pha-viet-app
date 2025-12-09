import { create, StateCreator } from 'zustand';
import { eventService as defaultEventService } from '@/services';
import { IEventService } from '@/services'; // Import IEventService from '@/services'
import type { EventDto, PaginatedList, SearchPublicEventsQuery, GetPublicUpcomingEventsQuery } from '@/types';
import { parseError } from '@/utils/errorUtils';

interface EventState {
  event: EventDto | null;
  events: EventDto[];
  paginatedEvents: PaginatedList<EventDto> | null;
  upcomingEvents: EventDto[];
  loading: boolean;
  error: string | null;
  page: number; // Renamed from currentPage
  hasMore: boolean;
}

interface EventActions {
  getEventById: (id: string) => Promise<void>;
  fetchEvents: (familyId: string, query: SearchPublicEventsQuery, isLoadMore: boolean) => Promise<PaginatedList<EventDto> | null>;
  fetchUpcomingEvents: (query: GetPublicUpcomingEventsQuery) => Promise<EventDto[] | null>;
  reset: () => void;
  setError: (error: string | null) => void;
}

export type EventStore = EventState & EventActions;

const PAGE_SIZE = 10; // Define page size for pagination

// Factory function to create the store
export const createPublicEventStore = (
  eventService: IEventService
): StateCreator<EventStore> => (set, get) => ({
  event: null,
  events: [],
  paginatedEvents: null,
  upcomingEvents: [],
  loading: false,
  error: null,
  page: 1, // Initialize page
  hasMore: true, // Initialize hasMore
  
  getEventById: async (id: string) => {
    set(state => ({ ...state, loading: true, error: null }));
    try {
      const result = await eventService.getEventById(id);
      if (result.isSuccess && result.value) {
        set(state => ({ ...state, event: result.value }));
      } else {
        const errorMessage = parseError(result.error);
        set(state => ({ ...state, error: errorMessage }));
      }
    } catch (err: any) {
      const errorMessage = parseError(err);
      set(state => ({ ...state, error: errorMessage }));
    } finally {
      set(state => ({ ...state, loading: false }));
    }
  },

  fetchEvents: async (familyId: string, query: SearchPublicEventsQuery, isLoadMore: boolean): Promise<PaginatedList<EventDto> | null> => {
    set(state => ({ ...state, loading: true, error: null }));
    try {
      const effectivePage = query.page || 1; // Ensure it's never undefined

      const result = await eventService.searchEvents({
        ...query,
        familyId: familyId,
        page: effectivePage, // Use the page number from the query
        itemsPerPage: PAGE_SIZE,
      });

      if (result.isSuccess && result.value) {
        const response = result.value;
        const newEvents = response.items;
        const currentEvents = get().events; // Get current events from the store directly

        const filteredNewEvents = isLoadMore
          ? newEvents.filter(
              (newEvent) => !currentEvents.some((existingEvent: EventDto) => existingEvent.id === newEvent.id)
            )
          : newEvents;

        set((state) => ({
          events: isLoadMore ? [...state.events, ...filteredNewEvents] : filteredNewEvents,
          page: response.page,
          hasMore: response.page < response.totalPages,
        }));
        return response;
      } else {
        const errorMessage = parseError(result.error);
        set(state => ({ ...state, error: errorMessage }));
        return null;
      }
    } catch (err: any) {
      const errorMessage = parseError(err);
      set(state => ({ ...state, error: errorMessage }));
      return null;
    } finally {
      set(state => ({ ...state, loading: false }));
    }
  },

  fetchUpcomingEvents: async (query: GetPublicUpcomingEventsQuery): Promise<EventDto[] | null> => {
    set(state => ({ ...state, loading: true, error: null }));
    try {
      const result = await eventService.getUpcomingEvents(query);
      if (result.isSuccess && result.value) {
        set(state => ({ ...state, upcomingEvents: result.value }));
        return result.value;
      } else {
        const errorMessage = parseError(result.error);
        set(state => ({ ...state, error: errorMessage }));
        return null;
      }
    } catch (err: any) {
      const errorMessage = parseError(err);
      set(state => ({ ...state, error: errorMessage }));
      return null;
    } finally {
      set(state => ({ ...state, loading: false }));
    }
  },

  reset: () =>
    set({
      event: null,
      events: [],
      paginatedEvents: null,
      upcomingEvents: [],
      loading: false,
      error: null,
      page: 1,
      hasMore: true,
    }),
  setError: (error: string | null) => set(state => ({ ...state, error })),
});

// Export default store instance
export const usePublicEventStore = create<EventStore>(createPublicEventStore(defaultEventService));