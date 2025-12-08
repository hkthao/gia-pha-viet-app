import { renderHook, act } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react-native';
import { usePaginatedSearch, PaginatedSearchOptions, ZustandPaginatedStore } from '@/hooks/usePaginatedSearch';
import { QueryParams } from '@/utils/core/queryUtils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue'; // Import the actual hook

// Mock the useDebouncedValue hook
jest.mock('@/hooks/useDebouncedValue', () => ({
  useDebouncedValue: jest.fn((value) => value), // By default, return the value immediately
}));

// Define a generic test item and query type
interface TestItem {
  id: string;
  name: string;
}

interface TestQueryParams extends QueryParams {
  searchTerm?: string;
  category?: string;
}

// Helper to create a mock Zustand store
const createMockStore = <T, Q extends QueryParams>(initialState: {
  items?: T[];
  loading?: boolean;
  error?: string | null;
  hasMore?: boolean;
}) => {
  const store: ZustandPaginatedStore<T, Q> = {
    items: initialState.items || [],
    loading: initialState.loading || false,
    error: initialState.error === undefined ? null : initialState.error,
    hasMore: initialState.hasMore === undefined ? false : initialState.hasMore,
    page: 1, // Default page
    fetch: jest.fn(),
    reset: jest.fn(),
    setError: jest.fn(),
  };

  const useStore = jest.fn(() => store);
  return { store, useStore };
};

describe('usePaginatedSearch', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (useDebouncedValue as jest.Mock).mockClear();
    (useDebouncedValue as jest.Mock).mockImplementation((value) => value); // Default behavior
  });

  // Test Case 1: Initial Render
  it('should initialize with correct default values and fetch data on mount', async () => {
    const { store, useStore } = createMockStore<TestItem, TestQueryParams>({
      items: [],
      loading: false,
      error: null,
      hasMore: false,
    });

    const initialQuery = { searchTerm: '', category: 'all' };

    const { result, waitForNextUpdate } = renderHook(() =>
      usePaginatedSearch<TestItem, TestQueryParams>({
        useStore,
        initialQuery,
      })
    );

    // Initial state check
    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.searchQuery).toBe('');
    expect(result.current.filters).toEqual(initialQuery);
    expect(result.current.refreshing).toBe(false);

    // Verify fetch is called with initial query
    await waitFor(() => {
      expect(store.fetch).toHaveBeenCalledTimes(1);
      expect(store.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: '',
          category: 'all',
          page: 1,
        }),
        false
      );
    });
  });

  // Test Case 2: setSearchQuery updates and triggers fetch after debounce
  it('should update search query, debounce it, and trigger a fetch', async () => {
    const { store, useStore } = createMockStore<TestItem, TestQueryParams>({});
    const initialQuery = { searchTerm: '', category: 'all' };
    const debounceTime = 100;

    const { result, rerender, waitForValueToChange } = renderHook(() =>
      usePaginatedSearch<TestItem, TestQueryParams>({
        useStore,
        initialQuery,
        debounceTime,
      })
    );

    // Clear initial fetch call
    (store.fetch as jest.Mock).mockClear();

    // Mock debounced value to control when it updates
    let debouncedValue = '';
    (useDebouncedValue as jest.Mock).mockImplementation((value) => debouncedValue);
    rerender(); // Rerender to apply new mock implementation

    // Set search query
    act(() => {
      result.current.setSearchQuery('test');
    });

    // Search query should update immediately, but fetch should not be called yet due to debounce
    expect(result.current.searchQuery).toBe('test');
    expect(store.fetch).not.toHaveBeenCalled();

    // Simulate debounce passing
    debouncedValue = 'test';
    (useDebouncedValue as jest.Mock).mockImplementation((value) => debouncedValue);
    rerender(); // Rerender to apply the debounced value

    await waitFor(() => {
      expect(store.fetch).toHaveBeenCalledTimes(1);
      expect(store.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: 'test',
          category: 'all',
          page: 1,
        }),
        false
      );
    });

    // Verify page resets to 1 on search query change
    const previousFetchCallCount = (store.fetch as jest.Mock).mock.calls.length;
    (store.fetch as jest.Mock).mockClear();

    debouncedValue = 'another';
    (useDebouncedValue as jest.Mock).mockImplementation((value) => debouncedValue);
    act(() => {
        result.current.setSearchQuery('another');
    });
    rerender();

    await waitFor(() => {
        expect(store.fetch).toHaveBeenCalledTimes(1);
        expect(store.fetch).toHaveBeenCalledWith(
            expect.objectContaining({
                searchTerm: 'another',
                category: 'all',
                page: 1,
            }),
            false
        );
    });
  });

  // Test Case 3: setFilters updates and triggers fetch
  it('should update filters and trigger a fetch', async () => {
    const { store, useStore } = createMockStore<TestItem, TestQueryParams>({});
    const initialQuery = { searchTerm: '', category: 'all' };

    const { result, rerender } = renderHook(() =>
      usePaginatedSearch<TestItem, TestQueryParams>({
        useStore,
        initialQuery,
      })
    );

    // Clear initial fetch call
    (store.fetch as jest.Mock).mockClear();

    // Set new filter
    act(() => {
      result.current.setFilters({ category: 'filtered' });
    });

    expect(result.current.filters).toEqual(
      expect.objectContaining({
        category: 'filtered',
        searchTerm: '', // searchTerm from initialQuery should persist if not explicitly changed
      })
    );

    // Verify fetch is called with updated filters and page 1
    await waitFor(() => {
      expect(store.fetch).toHaveBeenCalledTimes(1);
      expect(store.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: '',
          category: 'filtered',
          page: 1,
        }),
        false
      );
    });

    // Test with a function for setFilters
    act(() => {
      result.current.setFilters((prevFilters) => ({
        ...prevFilters,
        searchTerm: 'new term',
      }));
    });

    expect(result.current.filters).toEqual(
      expect.objectContaining({
        category: 'filtered',
        searchTerm: 'new term',
      })
    );

    await waitFor(() => {
      expect(store.fetch).toHaveBeenCalledTimes(2); // Should have been called again
      expect(store.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: 'new term',
          category: 'filtered',
          page: 1,
        }),
        false
      );
    });
  });

  // Test Case 4: handleLoadMore increments page and triggers fetch
  it('should increment page on handleLoadMore and trigger a fetch with isLoadMore as true', async () => {
    const { store, useStore } = createMockStore<TestItem, TestQueryParams>({});
    const initialQuery = { searchTerm: '', category: 'all' };

    const { result } = renderHook(() =>
      usePaginatedSearch<TestItem, TestQueryParams>({
        useStore,
        initialQuery,
      })
    );

    // Ensure initial fetch has completed
    await waitFor(() => expect(store.fetch).toHaveBeenCalledTimes(1));
    (store.fetch as jest.Mock).mockClear(); // Clear initial fetch call for new assertions

    act(() => {
      result.current.handleLoadMore();
    });

    // Check if fetch was called with page 2 and isLoadMore true
    await waitFor(() => {
      expect(store.fetch).toHaveBeenCalledTimes(1);
      expect(store.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: '',
          category: 'all',
          page: 2,
        }),
        true // isLoadMore should be true
      );
    });
  });

      // Test Case 5: handleRefresh resets state and triggers a new fetch
      it('should reset state and trigger a new fetch on handleRefresh', async () => {
        const { store, useStore } = createMockStore<TestItem, TestQueryParams>({});
        const initialQuery = { searchTerm: 'initial', category: 'all' };
    
        const { result, rerender } = renderHook(() =>
          usePaginatedSearch<TestItem, TestQueryParams>({
            useStore,
            initialQuery,
          })
        );
    
        // Ensure initial fetch has completed
        await waitFor(() => expect(store.fetch).toHaveBeenCalledTimes(1));
        (store.fetch as jest.Mock).mockClear(); // Clear initial fetch call for new assertions
    
        // Simulate some state changes
        act(() => {
          result.current.setSearchQuery('modified');
          result.current.setFilters({ category: 'filtered' });
        });
    
        // Simulate debouncedValue catching up after setSearchQuery
        (useDebouncedValue as jest.Mock).mockImplementation((value) => 'modified');
        rerender();
        await waitFor(() => {
          expect(store.fetch).toHaveBeenCalledWith(
            expect.objectContaining({ searchTerm: 'modified', category: 'filtered', page: 1 }),
            false
          );
        });
        (store.fetch as jest.Mock).mockClear(); // Clear fetch call from modified state
    
        // Now call handleRefresh
        act(() => {
          result.current.handleRefresh();
          // After handleRefresh, state.search is reset to initialQuery.searchTerm
          // So, mock useDebouncedValue to return initialQuery.searchTerm immediately
          (useDebouncedValue as jest.Mock).mockImplementation((value) => initialQuery.searchTerm);
        });
        rerender(); // Rerender to apply the new debounced value and trigger useEffect
    
        // Verify store.reset was called
        expect(store.reset).toHaveBeenCalledTimes(1);
    
        // Verify local state is reset
        expect(result.current.searchQuery).toBe(initialQuery.searchTerm);
        expect(result.current.filters).toEqual(initialQuery);
    
        // Verify fetch is called with initial query and page 1
        await waitFor(() => {
          expect(store.fetch).toHaveBeenCalledTimes(1);
          expect(store.fetch).toHaveBeenCalledWith(
            expect.objectContaining({
              searchTerm: initialQuery.searchTerm,
              category: initialQuery.category,
              page: 1,
            }),
            false
          );
        });
      });

      // Test Case 6: resetAll resets state and triggers a new fetch
      it('should reset all state and trigger a new fetch on resetAll', async () => {
        const { store, useStore } = createMockStore<TestItem, TestQueryParams>({});
        const initialQuery = { searchTerm: 'initial', category: 'all' };
    
        const { result, rerender } = renderHook(() =>
          usePaginatedSearch<TestItem, TestQueryParams>({
            useStore,
            initialQuery,
          })
        );
    
        // Ensure initial fetch has completed
        await waitFor(() => expect(store.fetch).toHaveBeenCalledTimes(1));
        (store.fetch as jest.Mock).mockClear(); // Clear initial fetch call for new assertions
    
        // Simulate some state changes
        act(() => {
          result.current.setSearchQuery('modified');
          result.current.setFilters({ category: 'filtered' });
          result.current.handleLoadMore(); // Increment page
        });

        // Simulate debouncedValue catching up after setSearchQuery
        (useDebouncedValue as jest.Mock).mockImplementation((value) => 'modified');
        rerender();
        await waitFor(() => {
            expect(store.fetch).toHaveBeenCalledWith(
                expect.objectContaining({ searchTerm: 'modified', category: 'filtered', page: 2 }), // Page is 2
                true
            );
        });
        (store.fetch as jest.Mock).mockClear(); // Clear fetch call from modified state
    
        // Now call resetAll
        act(() => {
          result.current.resetAll();
          // After resetAll, state.search is reset to initialQuery.searchTerm
          // So, mock useDebouncedValue to return initialQuery.searchTerm immediately
          (useDebouncedValue as jest.Mock).mockImplementation((value) => initialQuery.searchTerm);
        });
        rerender(); // Rerender to apply the new debounced value and trigger useEffect
    
        // Verify store.reset was called
        expect(store.reset).toHaveBeenCalledTimes(1);
    
        // Verify local state is reset
        expect(result.current.searchQuery).toBe(initialQuery.searchTerm);
        expect(result.current.filters).toEqual(initialQuery);
    
        // Verify fetch is called with initial query and page 1
        await waitFor(() => {
          expect(store.fetch).toHaveBeenCalledTimes(1);
          expect(store.fetch).toHaveBeenCalledWith(
            expect.objectContaining({
              searchTerm: initialQuery.searchTerm,
              category: initialQuery.category,
              page: 1,
            }),
            false
          );
        });
      });
    });

