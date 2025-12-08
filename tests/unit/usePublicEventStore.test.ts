import { act, renderHook } from '@testing-library/react-hooks';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { createPublicEventStore, EventStore } from '@/stores/usePublicEventStore';
import { IEventService } from '@/services';
import { EventDto, PaginatedList, Result } from '@/types';

// Mock authService to prevent it from trying to initialize Auth0 components and AsyncStorage
jest.mock('@/services/authService', () => ({
  authService: {
    getAccessToken: jest.fn(() => null),
    login: jest.fn(() => Promise.resolve()),
    logout: jest.fn(() => Promise.resolve()),
    register: jest.fn(() => Promise.resolve()),
    retrieveAuthSession: jest.fn(() => Promise.resolve(null)),
    refreshAccessToken: jest.fn(() => Promise.resolve(null)),
    getTokenClaims: jest.fn(() => null),
    isAuthenticated: jest.fn(() => false),
  },
}));

// Mock Event data for testing
const mockEvent: EventDto = {
  id: 'event1',
  name: 'Family Reunion', // Changed from title to name
  description: 'Annual family gathering',
  location: 'Community Hall',
  startDate: '2025-12-25T10:00:00Z', // Changed from dateTime
  familyId: 'family123',
  createdBy: 'user1',
  created: '2024-01-01T00:00:00Z',
  type: 0, // Assuming a default EventType
  relatedMembers: [],
};

const mockEventsPage1: PaginatedList<EventDto> = {
  items: [
    { ...mockEvent, id: 'eventA', name: 'Event A' }, // Changed title to name
    { ...mockEvent, id: 'eventB', name: 'Event B' }, // Changed title to name
  ],
  page: 1,
  totalItems: 20, // Keep totalItems
  totalPages: 2,
};

const mockEventsPage2: PaginatedList<EventDto> = {
  items: [
    { ...mockEvent, id: 'eventC', name: 'Event C' }, // Changed title to name
    { ...mockEvent, id: 'eventD', name: 'Event D' }, // Changed title to name
  ],
  page: 2,
  totalItems: 20, // Keep totalItems
  totalPages: 2,
};

const mockUpcomingEvents: EventDto[] = [
  { ...mockEvent, id: 'upcoming1', name: 'Upcoming Event 1' }, // Changed title to name
  { ...mockEvent, id: 'upcoming2', name: 'Upcoming Event 2' }, // Changed title to name
];

describe('usePublicEventStore', () => {
  let mockEventService: IEventService;
  let useStore: UseBoundStore<StoreApi<EventStore>>;

  beforeEach(() => {
    mockEventService = {
      getEventById: jest.fn(),
      searchEvents: jest.fn(),
      getUpcomingEvents: jest.fn(),
    };

    const storeFactory = createPublicEventStore(mockEventService);
    useStore = create(storeFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useStore((state) => state));

    expect(result.current.event).toBeNull();
    expect(result.current.events).toEqual([]);
    expect(result.current.paginatedEvents).toBeNull();
    expect(result.current.upcomingEvents).toEqual([]);
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();
    expect(result.current.page).toBe(1);
    expect(result.current.hasMore).toBeTruthy();
  });

  describe('getEventById', () => {
    it('should fetch event by id successfully', async () => {
      (mockEventService.getEventById as jest.Mock).mockResolvedValueOnce({
        isSuccess: true,
        value: mockEvent,
      } as Result<EventDto>);

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.getEventById('event1');
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockEventService.getEventById).toHaveBeenCalledWith('event1');
      expect(result.current.event).toEqual(mockEvent);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should handle API error when fetching event by id', async () => {
      const errorMessage = 'Event not found';
      (mockEventService.getEventById as jest.Mock).mockResolvedValueOnce({
        isSuccess: false,
        error: { message: errorMessage },
      } as Result<EventDto>);

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.getEventById('event1');
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockEventService.getEventById).toHaveBeenCalledWith('event1');
      expect(result.current.event).toBeNull();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle thrown error when fetching event by id', async () => {
      const errorMessage = 'Network error';
      (mockEventService.getEventById as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.getEventById('event1');
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockEventService.getEventById).toHaveBeenCalledWith('event1');
      expect(result.current.event).toBeNull();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('fetchEvents', () => {
    const familyId = 'family123';
    const query = { searchTerm: 'reunion' };

    it('should fetch initial events successfully', async () => {
      (mockEventService.searchEvents as jest.Mock).mockResolvedValueOnce({
        isSuccess: true,
        value: mockEventsPage1,
      } as Result<PaginatedList<EventDto>>);

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.fetchEvents(familyId, query, false);
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockEventService.searchEvents).toHaveBeenCalledWith({
        ...query,
        familyId,
        page: 1,
        itemsPerPage: 10,
      });
      expect(result.current.events).toEqual(mockEventsPage1.items);
      expect(result.current.paginatedEvents).toEqual(mockEventsPage1);
      expect(result.current.page).toBe(1);
      expect(result.current.hasMore).toBeTruthy();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should load more events successfully', async () => {
      // Initial fetch
      (mockEventService.searchEvents as jest.Mock)
        .mockResolvedValueOnce({ isSuccess: true, value: mockEventsPage1 })
        .mockResolvedValueOnce({ isSuccess: true, value: mockEventsPage2 });

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      await act(async () => {
        await result.current.fetchEvents(familyId, query, false); // First page
      });

      expect(result.current.events).toEqual(mockEventsPage1.items);
      expect(result.current.page).toBe(1);

      await act(async () => {
        await result.current.fetchEvents(familyId, query, true); // Load more
      });

      expect(mockEventService.searchEvents).toHaveBeenCalledWith({
        ...query,
        familyId,
        page: 2,
        itemsPerPage: 10,
      });
      expect(result.current.events).toEqual([...mockEventsPage1.items, ...mockEventsPage2.items]);
      expect(result.current.paginatedEvents).toEqual(mockEventsPage2);
      expect(result.current.page).toBe(2);
      expect(result.current.hasMore).toBeFalsy();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should handle API error when fetching events', async () => {
      const errorMessage = 'Failed to load events';
      (mockEventService.searchEvents as jest.Mock).mockResolvedValueOnce({
        isSuccess: false,
        error: { message: errorMessage },
      } as Result<PaginatedList<EventDto>>);

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.fetchEvents(familyId, query, false);
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockEventService.searchEvents).toHaveBeenCalledWith({
        ...query,
        familyId,
        page: 1,
        itemsPerPage: 10,
      });
      expect(result.current.events).toEqual([]); // Initial state, not updated
      expect(result.current.paginatedEvents).toBeNull();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle thrown error when fetching events', async () => {
      const errorMessage = 'Network issue';
      (mockEventService.searchEvents as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.fetchEvents(familyId, query, false);
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockEventService.searchEvents).toHaveBeenCalledWith({
        ...query,
        familyId,
        page: 1,
        itemsPerPage: 10,
      });
      expect(result.current.events).toEqual([]);
      expect(result.current.paginatedEvents).toBeNull();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('fetchUpcomingEvents', () => {
    const query = { familyId: 'family123', startDate: '2025-01-01T00:00:00Z' };

    it('should fetch upcoming events successfully', async () => {
      (mockEventService.getUpcomingEvents as jest.Mock).mockResolvedValueOnce({
        isSuccess: true,
        value: mockUpcomingEvents,
      } as Result<EventDto[]>);

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.fetchUpcomingEvents(query);
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockEventService.getUpcomingEvents).toHaveBeenCalledWith(query);
      expect(result.current.upcomingEvents).toEqual(mockUpcomingEvents);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should handle API error when fetching upcoming events', async () => {
      const errorMessage = 'No upcoming events';
      (mockEventService.getUpcomingEvents as jest.Mock).mockResolvedValueOnce({
        isSuccess: false,
        error: { message: errorMessage },
      } as Result<EventDto[]>);

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.fetchUpcomingEvents(query);
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockEventService.getUpcomingEvents).toHaveBeenCalledWith(query);
      expect(result.current.upcomingEvents).toEqual([]);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle thrown error when fetching upcoming events', async () => {
      const errorMessage = 'Server error';
      (mockEventService.getUpcomingEvents as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.fetchUpcomingEvents(query);
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockEventService.getUpcomingEvents).toHaveBeenCalledWith(query);
      expect(result.current.upcomingEvents).toEqual([]);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  it('should reset the store state', async () => {
    // First, set some data to be able to reset
    (mockEventService.getEventById as jest.Mock).mockResolvedValueOnce({
      isSuccess: true,
      value: mockEvent,
    } as Result<EventDto>);

    const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

    act(() => {
      result.current.getEventById('event1');
    });
    await waitForNextUpdate(); // Wait for data to be fetched

    expect(result.current.event).toEqual(mockEvent);
    expect(result.current.loading).toBeFalsy();

    // Now, reset the store
    act(() => {
      result.current.reset();
    });

    expect(result.current.event).toBeNull();
    expect(result.current.events).toEqual([]);
    expect(result.current.paginatedEvents).toBeNull();
    expect(result.current.upcomingEvents).toEqual([]);
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();
    expect(result.current.page).toBe(1);
    expect(result.current.hasMore).toBeTruthy();
  });

  it('should set an error message', () => {
    const { result } = renderHook(() => useStore((state) => state));

    act(() => {
      result.current.setError('Custom error message');
    });

    expect(result.current.error).toBe('Custom error message');
  });
});
