import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PaginatedList, ApiError } from '@/types';
import { shallowEqual } from '../utils/shallowEqual'; // New import
import { buildQuery, shouldFetch, QueryParams } from '../utils/queryUtils'; // New import
import { useDebouncedValue } from './useDebouncedValue'; // New import
import { useStabilizedObject } from './useStabilizedObject'; // New import
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
  refreshing: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: Q;
  setFilters: (newFilters: Partial<Q> | ((prev: Q) => Partial<Q>)) => void; // Accepts Partial<Q> or a function updater
  handleRefresh: () => void;
  handleLoadMore: () => void;
  resetAll: () => void;
}
export function usePaginatedSearch<T, Q extends QueryParams>( // Extend Q to always have searchTerm
  options: PaginatedSearchOptions<T, Q>
): PaginatedSearchResult<T, Q> {
  const {
    useStore,
    initialQuery: rawInitialQuery, // Renamed to differentiate from the memoized version
    debounceTime = 400,
    externalDependencies: rawExternalDependencies = [],
  } = options;
  // Stabilize initialQuery and externalDependencies using the new hook
  const initialQuery = useStabilizedObject(rawInitialQuery);
  const externalDependencies = useStabilizedObject(rawExternalDependencies);
  // Destructure state and actions from the provided Zustand store hook
  const {
    items,
    loading,
    error,
    hasMore,
    fetch,
    reset,
    setError,
  } = useStore();
  const [searchQuery, setSearchQueryState] = useState(initialQuery.searchTerm || '');
  const debouncedSearchQuery = useDebouncedValue(searchQuery, debounceTime); // Use the new hook
  const [filters, setFiltersState] = useState<Q>({ ...initialQuery, searchTerm: initialQuery.searchTerm || '' } as Q);
  const [refreshing, setRefreshing] = useState(false);
  // Replace refs with state for better testability
  const [isForceFetching, setIsForceFetching] = useState(false);
  const [fetchMode, setFetchMode] = useState<'normal' | 'loadMore' | 'refresh'>('normal');
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  // Memoize the current query object using the new buildQuery pure function
  const currentQuery = useMemo(() => buildQuery(initialQuery, filters, debouncedSearchQuery),
    [initialQuery, filters, debouncedSearchQuery]
  );
  // Use a ref to track the previous query to prevent re-fetching if only reference changes
  const [previousFetchedQuery, setPreviousFetchedQuery] = useState<Q | null>(null);
  // Effect to trigger initial fetch and subsequent fetches on query/filter/dependency changes
  useEffect(() => {
    // Determine if a fetch should occur using the pure function
    if (!shouldFetch(previousFetchedQuery, currentQuery, isForceFetching)) {
      // console.log('Current query is shallowly equal to previous or not forced, skipping fetch.'); // Removed for clean output
      return;
    }
    // When a new fetch is initiated, clear any previous error
    if (error) { // Check if there was an error from a previous operation
      setError(null);
    }
    const isLoadMore = fetchMode === 'loadMore';
    fetch(currentQuery, isLoadMore);
    setPreviousFetchedQuery(currentQuery); // Update previous fetched query
    setIsForceFetching(false); // Reset force fetch
    setFetchMode('normal'); // Reset fetch mode after fetch
  }, [currentQuery, fetch, setError, previousFetchedQuery, isForceFetching, fetchMode, ...externalDependencies]);
  const handleRefresh = useCallback(async () => {
    if (loading) return;
    setRefreshing(true);
    setIsForceFetching(true); // Force fetch
    setFetchMode('refresh'); // Set mode to refresh
    try {
      // Reset local search query and filters state
      setSearchQueryState(initialQuery.searchTerm || '');
      setFiltersState({ ...initialQuery, searchTerm: initialQuery.searchTerm || '' } as Q); // This will reset page to initialQuery.page (e.g., 1)
      // Reset store's internal state (items, page, hasMore, etc.)
      reset();
      // The useEffect listening to currentQuery changes will trigger the fetch automatically
    } catch (e: any) {
      setError(e.message || 'Error refreshing data');
    } finally {
      setRefreshing(false);
    }
  }, [loading, reset, setSearchQueryState, setFiltersState, initialQuery, setError]);
  const handleLoadMore = useCallback(async () => {
    if (loading || isFetchingMore || !hasMore || items.length === 0) return;
    setIsFetchingMore(true); // Set fetching more state
    setFetchMode('loadMore'); // Set mode to loadMore
    try {
      // Increment the page number for the next fetch
      setFiltersState((prevFilters) => {
        const nextPage = (prevFilters.page || 0) + 1;
        return { ...prevFilters, page: nextPage } as Q;
      });
      // The fetch will be triggered by the useEffect due to filters.page changing.
    } catch (e: any) {
      setError(e.message || 'Error loading more data');
    } finally {
      setIsFetchingMore(false); // Reset fetching more state
    }
  }, [loading, isFetchingMore, hasMore, items.length, setError, setFiltersState]);
  const setSearchQuery = useCallback((query: string) => {
    setFetchMode('normal'); // A search query change is a normal fetch
    setSearchQueryState(query);
    setFiltersState(prev => {
      const newFilters = { ...prev, searchTerm: query, page: 1 } as Q; // Reset page to 1 on search
      if (!shallowEqual(prev, newFilters)) {
        return newFilters;
      }
      return prev;
    });
  }, []);
  const setFilters = useCallback((newFilters: Partial<Q> | ((prev: Q) => Partial<Q>)) => {
    setFetchMode('normal'); // Filter changes are normal fetches
    setFiltersState(prev => {
      const updatedFilters = typeof newFilters === 'function' ? newFilters(prev) : newFilters;
      const finalFilters = { ...prev, ...updatedFilters, page: 1 } as Q; // Reset page to 1 on filter change
      if (!shallowEqual(prev, finalFilters)) {
        return finalFilters;
      }
      return prev;
    });
  }, []);
  const resetAll = useCallback(() => {
    setFetchMode('normal'); // Explicitly set normal mode
    setSearchQueryState(initialQuery.searchTerm || '');
    const resetFilters = { ...initialQuery, searchTerm: initialQuery.searchTerm || '', page: 1 } as Q;
    setFiltersState(prev => {
      if (!shallowEqual(prev, resetFilters)) {
        return resetFilters;
      }
      return prev;
    });
    reset();
  }, [initialQuery, reset]);
  return {
    items,
    loading,
    error,
    hasMore,
    refreshing,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    handleRefresh,
    handleLoadMore,
    resetAll,
  };
}