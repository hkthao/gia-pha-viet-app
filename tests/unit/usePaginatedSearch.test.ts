import { renderHook, act } from '@testing-library/react-hooks';
import { usePaginatedSearch } from '@/hooks/usePaginatedSearch';
import { createMockStore, MockZustandPaginatedStore } from '@/tests/unit/utils/mockZustandStore';
import { QueryParams } from '@/utils/queryUtils';
import { jest } from '@jest/globals';
import { PaginatedList } from '@/types';

// Mock data types
interface MockItem {
  id: string;
  name: string;
}

interface MockQuery extends QueryParams {
  category?: string;
}

// Mock initial query
const initialQuery: MockQuery = {
  searchTerm: '',
  page: 1,
  itemsPerPage: 10,
  category: 'all',
};

describe('usePaginatedSearch', () => {

  let mockStoreFactory: ReturnType<typeof createMockStore<MockItem, MockQuery>>;
  let mockStore: ReturnType<ReturnType<typeof createMockStore<MockItem, MockQuery>>>;
  let mockFetch: jest.Mock;
  let mockReset: jest.Mock;
  let mockSetError: jest.Mock;
  let fetchPromiseResolve: (value: PaginatedList<MockItem> | PromiseLike<PaginatedList<MockItem>>) => void;
  let fetchPromiseReject: (reason?: any) => void;

  beforeEach(() => {
    jest.useFakeTimers(); // Use Jest for mocking timers

    mockStoreFactory = createMockStore<MockItem, MockQuery>();
    mockStore = mockStoreFactory();
    mockFetch = mockStore.fetch as jest.Mock;
    mockReset = mockStore.reset as jest.Mock;
    mockSetError = mockStore.setError as jest.Mock;

    mockFetch.mockClear();
    mockReset.mockClear();
    mockSetError.mockClear();

    // Controlled mock fetch implementation
    mockFetch.mockImplementation(async (query, isLoadMore) => {
      act(() => {
        mockStore.loading = true;
        mockStore.error = null;
      });

      const response = await new Promise<PaginatedList<MockItem>>((resolve, reject) => {
        fetchPromiseResolve = resolve;
        fetchPromiseReject = reject;
      });

      act(() => {
        mockStore.items = response.items;
        mockStore.hasMore = response.page < response.totalPages;
        mockStore.page = response.page; // Update page in mock store
        mockStore.loading = false;
        mockStore.error = null;
      });

      return response;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should fetch data on initial render', async () => {
    const { result, rerender } = renderHook(() => usePaginatedSearch({ useStore: mockStoreFactory, initialQuery }));

    const storeInstance = mockStoreFactory() as MockZustandPaginatedStore<MockItem, MockQuery>; // Get the actual store instance for subscription
    let cleanupSubscription = () => { };

    act(() => {
      storeInstance.subscribe(rerender);
      cleanupSubscription = () => storeInstance.unsubscribe(rerender);
    });

    // Ensure all pending timers are advanced to let the useEffect run
    // and for mockFetch to be called.
    // Use an await act() to ensure the initial render and its synchronous effects are processed
    await act(async () => {
        // No operations here, just waiting for effects to settle
    });
    // After initial render, useEffect in usePaginatedSearch has called mockFetch,
    // and mockFetch's first act has set mockStore.loading = true.
    expect(mockFetch).toHaveBeenCalledWith(initialQuery, false);
    expect(result.current.loading).toBe(true);

    // Now, resolve the outstanding promise and await its effects
    await act(async () => {
      // Resolve the promise controlled by the mockFetch
      fetchPromiseResolve({
        items: [{ id: '1', name: 'Test Item 1' }, { id: '2', name: 'Test Item 2' }],
        totalItems: 2,
        page: 1,
        totalPages: 1,
      });
      // Advance all timers so that the internal promise resolution and effects complete.
      jest.runAllTimers();
      // Ensure all microtasks (including internal acts) are flushed
      await Promise.resolve();
    });

    // After all async operations and renders, check the final state.
    expect(result.current.loading).toBe(false);
    expect(result.current.items.length).toBeGreaterThan(0);
    expect(result.current.hasMore).toBe(true);

    // Unsubscribe rerender from mockStore changes to clean up
    act(() => {
      cleanupSubscription();
    });
  });

});


