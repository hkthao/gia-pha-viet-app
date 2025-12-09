import { useState, useMemo, useCallback, useEffect } from "react";
import type { PaginatedList } from "@/types";
import { useDebouncedValue } from "./useDebouncedValue";
import { QueryParams, buildQuery } from "@/utils/core/queryUtils";

export function usePaginatedSearch<T, Q extends QueryParams>(options: {
  useStore: () => {
    items: T[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    page: number;
    refresh: (query: Q) => Promise<PaginatedList<T> | null>;
    loadMore: (query: Q) => Promise<PaginatedList<T> | null>;
    reset: () => void;
    setError: (e: string | null) => void;
  };
  initialQuery: Q;
  debounceTime?: number;
  externalDependencies?: any[];
}) {
  const { useStore, initialQuery, debounceTime = 400 } = options;
  const { items, loading, error, hasMore, page: storePage, refresh, loadMore, reset } = useStore();

  const [searchQuery, setSearchQuery] = useState(initialQuery.searchQuery || "");
  const [filters, setFilters] = useState<Q>(initialQuery);
  const [refreshing, setRefreshing] = useState(false);

  const debouncedSearch = useDebouncedValue(searchQuery, debounceTime);

  /** Build final query (without page, as refresh/loadMore handle it) */
  const query = useMemo(
    () =>
      buildQuery(initialQuery, filters, debouncedSearch),
    [filters, debouncedSearch]
  );

  /** Fetch on any query change (triggers refresh) */
  useEffect(() => {
    reset(); // Ensure store is reset before new query fetch
    refresh(query).finally(() => {
      // Only set refreshing to false if it was initiated by a refresh cycle
      // The refreshing state is now controlled by handleRefresh directly after its fetch
    });
  }, [query, refresh, reset]); // Add 'reset' to dependencies

  /** Load more */
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && !refreshing) {
      loadMore(query);
    }
  }, [loading, hasMore, refreshing, query, loadMore]); // Add 'loadMore' to dependencies

  /** Refresh */
  const handleRefresh = useCallback(() => {
    if (refreshing) return;

    setRefreshing(true);
    reset(); // reset store → page=1, items=[], hasMore=true (this will also reset the store's internal page state)

    // Directly call refresh with the initial query.
    // This fetch will then set refreshing to false in its finally block
    refresh(initialQuery).finally(() => {
      setRefreshing(false); // Ensure refreshing state is reset
    });

    setFilters(initialQuery); // This will cause 'query' to change, but useEffect should not refetch if handleRefresh already did.
    setSearchQuery(initialQuery.searchQuery || "");
  }, [refreshing, initialQuery, reset, refresh]); // Add 'refresh' and 'reset' to dependencies


  /** Update filters */
  const updateFilters = useCallback((f: Partial<Q> | ((prev: Q) => Partial<Q>)) => {
    setFilters(prev => ({
      ...prev,
      ...(typeof f === "function" ? f(prev) : f),
      page: 1,
    }));
  }, []);

  /** Reset all */
  const resetAll = useCallback(() => {
    reset();
    setSearchQuery(initialQuery.searchQuery || "");
    setFilters(initialQuery);
  }, [initialQuery]);

  return {
    items,
    loading,
    error,
    hasMore,
    refreshing,
    searchQuery: searchQuery,
    setSearchQuery: setSearchQuery,
    filters,
    setFilters: updateFilters,
    handleLoadMore,
    handleRefresh,
    resetAll,
  };
}