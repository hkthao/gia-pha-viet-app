// tests/unit/hooks/usePaginatedSearch.test.tsx

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePaginatedSearch, PaginatedSearchOptions } from '@/hooks/usePaginatedSearch';
import { ZustandPaginatedStore } from '@/hooks/usePaginatedSearch';
import { QueryParams, buildQuery } from '@/utils/core/queryUtils';
import { PaginatedList } from '@/types';
import { searchReducer } from '@/utils/core/searchReducer';
import { useState, useRef, useEffect } from 'react'; // Import useState, useRef, useEffect
import { shallowEqual } from '@/utils/core/shallowEqual'; // Import shallowEqual

// Mock the debounce hook to immediately return the value for testing
jest.mock('@/hooks/useDebouncedValue', () => ({
  useDebouncedValue: jest.fn((value) => value),
}));

// Mock the shallowEqual and buildQuery utilities
jest.mock('@/utils/core/shallowEqual', () => ({
  // Default to false to always trigger re-computation in tests unless specifically testing shallowEqual
  shallowEqual: jest.fn((a, b) => JSON.stringify(a) === JSON.stringify(b)), // More robust for tests
}));
jest.mock('@/utils/core/queryUtils', () => ({
  buildQuery: jest.fn((initial, filters, search) => ({ ...initial, ...filters, searchTerm: search })),
}));


interface MockItem {
  id: string;
  name: string;
}

interface MockQueryParams extends QueryParams {
  searchTerm?: string;
  filterA?: string;
}

// Helper to create a mock store that behaves more like Zustand
const createMockStore = () => {
  let _storeData = { // Internal data for the mock store
    items: [] as MockItem[],
    loading: false,
    error: null as string | null,
    hasMore: true,
    page: 1,
  };

  const listeners = new Set<() => void>(); // Listeners for Zustand-like updates

  const notifyListeners = () => {
    listeners.forEach(listener => listener());
  };

  const mockStore: ZustandPaginatedStore<MockItem, MockQueryParams> = {
    get items() { return _storeData.items; },
    get loading() { return _storeData.loading; },
    get error() { return _storeData.error; },
    get hasMore() { return _storeData.hasMore; },
    get page() { return _storeData.page; },
    
    fetch: jest.fn(async (query: MockQueryParams, isLoadMore: boolean): Promise<PaginatedList<MockItem> | null> => {
      // Synchronously set loading to true and notify listeners
      _storeData.loading = true;
      notifyListeners(); 

      // Simulate async API call and data update in a separate, deferred way
      const promise = new Promise<PaginatedList<MockItem> | null>(async (resolve) => {
        await new Promise(res => setTimeout(res, 50)); // Simulate API call delay

        let newItems: MockItem[];
        let newHasMore: boolean;

        if (query.page === 1) {
          newItems = [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }];
          newHasMore = true;
        } else if (query.page === 2) {
          // Correctly append items for load more
          newItems = [..._storeData.items, { id: '3', name: 'Item 3' }, { id: '4', name: 'Item 4' }];
          newHasMore = false;
        } else {
          newItems = [..._storeData.items]; // No new items
          newHasMore = false;
        }

        _storeData = {
          ..._storeData,
          items: newItems,
          loading: false, // Set loading to false when data is ready
          error: null,
          hasMore: newHasMore,
          page: query.page, // Update internal page state based on query
        };
        notifyListeners(); // Notify data change and loading: false
        resolve({
          items: newItems,
          totalCount: newItems.length,
          hasMore: newHasMore,
          page: query.page,
          pageSize: 2,
        });
      });
      return promise; // Return the promise immediately
    }),
    reset: jest.fn(() => {
      _storeData = { items: [], loading: false, error: null, hasMore: true, page: 1 };
      notifyListeners();
    }),
    setError: jest.fn((e: string | null) => {
      _storeData = { ..._storeData, error: e };
      notifyListeners();
    }),
  };

  // This hook simulates Zustand's useStore and triggers re-renders
  const useMockStore = () => {
    const [state, setState] = useState(_storeData); // Use internal state to trigger re-renders
    const stateRef = useRef(state); // Keep a ref to the current state

    // Subscribe to changes in _storeData
    useEffect(() => {
      const listener = () => {
        // Only update if the data has actually changed to prevent unnecessary re-renders
        if (JSON.stringify(stateRef.current) !== JSON.stringify(_storeData)) {
          setState(_storeData);
        }
      };
      listeners.add(listener);
      // Initial sync in case _storeData changed before useEffect ran
      listener(); 
      return () => {
        listeners.delete(listener);
      };
    }, []);

    // Update the ref whenever state changes
    useEffect(() => {
      stateRef.current = state;
    }, [state]);

    return {
      ...state,
      fetch: mockStore.fetch,
      reset: mockStore.reset,
      setError: mockStore.setError,
    };
  };

  return { mockStore, useMockStore };
};


describe('usePaginatedSearch', () => {
  let mockStoreContext: ReturnType<typeof createMockStore>;
  let initialQuery: MockQueryParams;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStoreContext = createMockStore();
    initialQuery = { page: 1, pageSize: 2, searchTerm: '' };
    (buildQuery as jest.Mock).mockClear();
    (buildQuery as jest.Mock).mockImplementation((initial, filters, search) => ({ ...initial, ...filters, searchTerm: search }));
    (jest.mocked(shallowEqual)).mockImplementation((a, b) => JSON.stringify(a) === JSON.stringify(b));
  });

  it('should fetch initial data on mount', async () => {
    const { result } = renderHook(() =>
      usePaginatedSearch({
        useStore: mockStoreContext.useMockStore,
        initialQuery,
      })
    );

    // Initial state check before fetch completes
    expect(result.current.loading).toBe(true); // Should be true while fetching
    expect(result.current.items).toEqual([]);

    await waitFor(() => {
      expect(mockStoreContext.mockStore.fetch).toHaveBeenCalledTimes(1);
      expect(mockStoreContext.mockStore.fetch).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, pageSize: 2, searchTerm: '' }),
        false
      );
      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[0]).toEqual({ id: '1', name: 'Item 1' });
      expect(result.current.loading).toBe(false);
      expect(result.current.hasMore).toBe(true);
    }, { timeout: 200 }); // Increased timeout for async operations
  });

  it('should increment page and fetch more data on handleLoadMore', async () => {
    const { result } = renderHook(() =>
      usePaginatedSearch({
        useStore: mockStoreContext.useMockStore,
        initialQuery,
      })
    );

    // Wait for initial fetch to complete
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(mockStoreContext.mockStore.fetch).toHaveBeenCalledTimes(1);

    // Trigger load more
    act(() => {
      result.current.handleLoadMore();
    });

    // Wait for load more fetch to complete
    await waitFor(() => {
      expect(mockStoreContext.mockStore.fetch).toHaveBeenCalledTimes(2);
      expect(mockStoreContext.mockStore.fetch).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, pageSize: 2, searchTerm: '' }),
        true
      );
      expect(result.current.items).toHaveLength(4);
      expect(result.current.items[2]).toEqual({ id: '3', name: 'Item 3' });
      expect(result.current.loading).toBe(false);
      expect(result.current.hasMore).toBe(false); // Based on mock data
    }, { timeout: 200 });
  });

  it('should reset page and fetch initial data on handleRefresh', async () => {
    const { result } = renderHook(() =>
      usePaginatedSearch({
        useStore: mockStoreContext.useMockStore,
        initialQuery,
      })
    );

    // Wait for initial fetch
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    // Load more to get to page 2
    act(() => {
      result.current.handleLoadMore();
    });
    await waitFor(() => expect(result.current.items).toHaveLength(4));
    expect(mockStoreContext.mockStore.fetch).toHaveBeenCalledTimes(2);

    // Trigger refresh
    act(() => {
      result.current.handleRefresh();
    });

    // Expect fetch to be called with page 1 again
    await waitFor(() => {
      expect(mockStoreContext.mockStore.fetch).toHaveBeenCalledTimes(3);
      expect(mockStoreContext.mockStore.fetch).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, pageSize: 2, searchTerm: '' }),
        false
      );
      // Mock store reset means items length should be 2 after refresh
      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[0]).toEqual({ id: '1', name: 'Item 1' });
      expect(result.current.loading).toBe(false);
      expect(result.current.refreshing).toBe(false);
      expect(result.current.hasMore).toBe(true);
    }, { timeout: 200 });
  });

  it('should update search query and refetch from page 1', async () => {
    const { result } = renderHook(() =>
      usePaginatedSearch({
        useStore: mockStoreContext.useMockStore,
        initialQuery,
      })
    );

    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(mockStoreContext.mockStore.fetch).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.setSearchQuery('new search');
    });

    await waitFor(() => {
      expect(mockStoreContext.mockStore.fetch).toHaveBeenCalledTimes(2);
      expect(mockStoreContext.mockStore.fetch).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, pageSize: 2, searchTerm: 'new search' }),
        false
      );
      // Items should be reset and then fetched with new query
      expect(result.current.items).toHaveLength(2); // Assuming mock fetch returns initial 2 items for any page 1 query
    }, { timeout: 200 });
  });

  it('should not load more if hasMore is false', async () => {
    const { result } = renderHook(() =>
      usePaginatedSearch({
        useStore: mockStoreContext.useMockStore,
        initialQuery,
      })
    );

    // Initial fetch to page 1
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(mockStoreContext.mockStore.fetch).toHaveBeenCalledTimes(1);

    // Load more to page 2 (which in mock sets hasMore to false)
    act(() => {
      result.current.handleLoadMore();
    });
    await waitFor(() => expect(result.current.items).toHaveLength(4));
    expect(result.current.hasMore).toBe(false);
    expect(mockStoreContext.mockStore.fetch).toHaveBeenCalledTimes(2);

    // Try to load more again
    act(() => {
      result.current.handleLoadMore();
    });

    // Fetch should not be called again
    await waitFor(() => {
      expect(mockStoreContext.mockStore.fetch).toHaveBeenCalledTimes(2); // Still 2 calls
    }, { timeout: 200 });
  });
});
