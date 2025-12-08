// apps/mobile/family_tree_rn/tests/unit/utils/mockZustandStore.ts
import { jest } from '@jest/globals';
import type { PaginatedList, ApiError } from '@/types';
import type { ZustandPaginatedStore } from '@/hooks/usePaginatedSearch';
import type { QueryParams } from '@/utils/core/queryUtils';
import { act } from '@testing-library/react-hooks';

type Listener = () => void;

// Define a new interface for the mock store that extends the real store interface
// and includes the subscribe/unsubscribe methods for testing.
export interface MockZustandPaginatedStore<T, Q extends QueryParams> extends ZustandPaginatedStore<T, Q> {
  subscribe: (listener: Listener) => void;
  unsubscribe: (listener: Listener) => void;
}

export function createMockStore<T, Q extends QueryParams>(initialItems: T[] = [], initialHasMore = false, initialPage = 1): () => MockZustandPaginatedStore<T, Q> {
  const listeners = new Set<Listener>(); // Moved inside closure for isolation

  function notifyListeners() {
    listeners.forEach(listener => listener());
  }

  let currentItems: T[] = initialItems;
  let currentLoading: boolean = false;
  let currentError: string | null = null;
  let currentHasMore: boolean = initialHasMore;
  let currentPage: number = initialPage;

  const mockFetch = jest.fn(async (query: Q, isLoadMore: boolean) => {
    act(() => {
      currentLoading = true;
      currentError = null;
      notifyListeners(); // Notify listeners when loading state changes
    });
    // This fetch mock should be configured in individual tests
    // to return specific PaginatedList data.
    return {
      items: [], // Default empty, should be set by individual tests
      page: currentPage,
      totalItems: 0,
      totalCount: 0,
      pageNumber: currentPage,
      totalPages: 1,
      pageSize: 10,
      hasPreviousPage: false,
      hasNextPage: false,
    } as PaginatedList<T>;
  });

  const mockReset = jest.fn(() => {
    act(() => {
      currentItems = initialItems;
      currentLoading = false;
      currentError = null;
      currentHasMore = initialHasMore;
      currentPage = initialPage;
      notifyListeners(); // Notify listeners when store is reset
    });
  });

  const mockSetError = jest.fn((err: string | null) => {
    act(() => {
      currentError = err;
      currentLoading = false; // Error implies loading finished
      notifyListeners(); // Notify listeners when error state changes
    });
  });

  // This function simulates the `useStore` hook signature.
  // It provides getters for state and direct access to mock functions for actions.
  // It also exposes subscribe/unsubscribe for reactivity.
  return () => ({
    get items() { return currentItems; },
    set items(newItems: T[]) {
      currentItems = newItems;
      notifyListeners(); // Notify listeners when items change
    },
    get loading() { return currentLoading; },
    set loading(isLoading: boolean) {
      currentLoading = isLoading;
      notifyListeners(); // Notify listeners when loading changes
    },
    get error() { return currentError; },
    set error(err: string | null) {
      currentError = err;
      notifyListeners(); // Notify listeners when error changes
    },
    get hasMore() { return currentHasMore; },
    set hasMore(val: boolean) {
      currentHasMore = val;
      notifyListeners(); // Notify listeners when hasMore changes
    },
    get page() { return currentPage; },
    set page(num: number) {
      currentPage = num;
      notifyListeners(); // Notify listeners when page changes
    },
    fetch: mockFetch,
    reset: mockReset,
    setError: mockSetError,
    // Add subscribe/unsubscribe methods for external reactivity
    subscribe: (listener: Listener) => listeners.add(listener),
    unsubscribe: (listener: Listener) => listeners.delete(listener),
  });
}