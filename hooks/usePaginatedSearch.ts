import { useEffect, useMemo, useReducer } from 'react';
import type { PaginatedList, ApiError } from '@/types';
import { buildQuery, QueryParams } from '@/utils/core/queryUtils';
import { useDebouncedValue } from './useDebouncedValue';
import { searchReducer, SearchReducerAction, SearchReducerState } from '@/utils/core/searchReducer';

export interface ZustandPaginatedStore<T, Q extends QueryParams> {
  items: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number; // Current page in the store, 1-indexed
  fetch: (query: Q, isLoadMore: boolean) => Promise<PaginatedList<T> | null>;
  reset: () => void;
  setError: (error: string | null) => void;
}

export interface PaginatedSearchOptions<T, Q extends QueryParams> {
  useStore: () => ZustandPaginatedStore<T, Q>; // A function that returns the Zustand store's state and actions
  initialQuery: Q; // Initial query/filter object
  debounceTime?: number; // Default to 400ms
  externalDependencies?: React.DependencyList; // Any external dependencies that should trigger a refetch (e.g., currentFamilyId)
}

export interface PaginatedSearchResult<T, Q> {
  items: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  refreshing: boolean; // Add refreshing state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: Q;
  setFilters: (newFilters: Partial<Q> | ((prev: Q) => Partial<Q>)) => void;
  handleRefresh: () => void;
  handleLoadMore: () => void;
  resetAll: () => void;
}

export function usePaginatedSearch<T, Q extends QueryParams>( // Extend Q to always have searchTerm
  options: PaginatedSearchOptions<T, Q>
): PaginatedSearchResult<T, Q> {
  const { useStore, initialQuery, debounceTime = 400 } = options;
  const { items, loading, error, hasMore, fetch, reset, setError } = useStore();

  const [state, dispatch] = useReducer(searchReducer as (state: SearchReducerState<Q>, action: SearchReducerAction<Q>) => SearchReducerState<Q>, {
    search: initialQuery.searchTerm || "",
    filters: initialQuery,
    page: 1,
  });

  const debouncedSearch = useDebouncedValue(state.search, debounceTime);

  const query = useMemo(
    () => buildQuery(initialQuery, { ...state.filters, page: state.page } as Q, debouncedSearch),
    [initialQuery, state.filters, state.page, debouncedSearch]
  );

  useEffect(() => {
    fetch(query, state.page > 1);
  }, [query, fetch, state.page]);

  return {
    items,
    loading,
    error,
    hasMore,
    refreshing: false, // For now, no explicit refreshing state in this simplified hook
    searchQuery: state.search,
    setSearchQuery: (s) => dispatch({ type: "SET_SEARCH", payload: s }),

    filters: state.filters,
    setFilters: (f) => dispatch({ type: "SET_FILTERS", payload: f }),

    handleLoadMore: () => dispatch({ type: "LOAD_MORE" }),
    handleRefresh: () => {
      reset(); // Reset the Zustand store
      dispatch({ type: "RESET", payload: initialQuery }); // Reset local state
    },
    resetAll: () => {
      reset(); // Reset the Zustand store
      dispatch({ type: "RESET", payload: initialQuery }); // Reset local state
    },
  };
}