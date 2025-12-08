import { useEffect, useMemo, useReducer, useRef, useCallback } from 'react';
import type { PaginatedList, ApiError } from '@/types';
import { buildQuery, QueryParams } from '@/utils/core/queryUtils';
import { useDebouncedValue } from './useDebouncedValue';
import { searchReducer, SearchReducerAction, SearchReducerState } from '@/utils/core/searchReducer';
import { shallowEqual } from '@/utils/core/shallowEqual';

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
    refreshing: false, // Initialize refreshing state
  });

  const debouncedSearch = useDebouncedValue(state.search, debounceTime);

  // useRef to store the last stable query object
  const lastStableQuery = useRef<Q | null>(null);

  const query = useMemo(() => {
    const newQuery = buildQuery(initialQuery, { ...state.filters, page: state.page } as Q, debouncedSearch);

    // If there's a last stable query and the new query is shallowly equal, return the last stable one
    if (lastStableQuery.current && shallowEqual(lastStableQuery.current, newQuery)) {
      return lastStableQuery.current;
    }

    // Otherwise, update the last stable query and return the new one
    lastStableQuery.current = newQuery;
    return newQuery;
  }, [initialQuery, state.filters, state.page, debouncedSearch]);

  const lastFetchedQueryRef = useRef<Q | null>(null);
  const initialDataLoadedRef = useRef(false); // New ref to track initial data load

  useEffect(() => {
    const loadData = async () => {
      // If we are on the first page, not refreshing, and the current query is the same
      // as the last successfully fetched query, then skip this fetch.
      // This prevents double-fetching on initial mount for the same query state.
      if (
        query.page === 1 &&
        !state.refreshing &&
        lastFetchedQueryRef.current &&
        shallowEqual(lastFetchedQueryRef.current, query)
      ) {
        return;
      }

      try {
        await fetch(query, state.page > 1);
        // After a successful fetch, update the lastFetchedQueryRef
        lastFetchedQueryRef.current = query;
        // Mark initial data as loaded if it was the first page fetch
        if (query.page === 1) {
          initialDataLoadedRef.current = true;
        }
      } finally {
        if (state.refreshing) {
          dispatch({ type: "END_REFRESH" });
        }
      }
    };

    loadData();

    // Cleanup function: If the component unmounts, clear the refs.
    // This ensures that if the component remounts (e.g., hot reload),
    // an initial fetch will occur again.
    return () => {
        lastFetchedQueryRef.current = null;
        initialDataLoadedRef.current = false; // Reset on unmount
    };

  }, [query, fetch, state.page, state.refreshing, dispatch]); // Add dispatch as a dependency

  const handleRefresh = useCallback(async () => {
    if (state.refreshing) return; // Prevent multiple refresh calls

    dispatch({ type: "START_REFRESH" });
    initialDataLoadedRef.current = false; // Reset this flag on refresh
    // Removed: reset(); // Reset the Zustand store
    dispatch({ type: "RESET", payload: initialQuery }); // Reset local state
    // Fetch will be triggered by useEffect reacting to the RESET action's change in query/state.page
  }, [state.refreshing, initialQuery, reset, dispatch]);

  const handleLoadMore = useCallback(() => {
    // Only allow load more if initial data has been loaded and conditions are met
    if (initialDataLoadedRef.current && !loading && hasMore && !state.refreshing) {
      dispatch({ type: "LOAD_MORE" });
    }
  }, [initialDataLoadedRef, loading, hasMore, state.refreshing, dispatch]);

  const setSearchQuery = useCallback((s: string) => dispatch({ type: "SET_SEARCH", payload: s }), [dispatch]);
  const setFilters = useCallback((f: Partial<Q> | ((prev: Q) => Partial<Q>)) => dispatch({ type: "SET_FILTERS", payload: f }), [dispatch]);
  const resetAll = useCallback(() => {
    reset(); // Reset the Zustand store
    dispatch({ type: "RESET", payload: initialQuery }); // Reset local state
  }, [reset, dispatch, initialQuery]);

  return {
    items,
    loading,
    error,
    hasMore,
    refreshing: state.refreshing, // Pass refreshing state from reducer
    searchQuery: state.search,
    setSearchQuery,
    filters: state.filters,
    setFilters,
    handleLoadMore,
    handleRefresh,
    resetAll,
  };
}