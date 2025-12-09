// apps/mobile/family_tree_rn/utils/queryUtils.ts
import { shallowEqual } from './shallowEqual';

// Định nghĩa lại các kiểu dữ liệu cần thiết cho hàm thuần túy
export interface QueryParams {
  searchQuery?: string;
  page?: number;
  itemsPerPage?: number;
  [key: string]: any; // Cho phép các thuộc tính khác
}

/**
 * Builds a complete query object by merging initial, filter, and debounced search terms.
 *
 * @param initialQuery The initial query object provided to the hook.
 * @param filters The current filter state.
 * @param debouncedSearch The debounced search term.
 * @returns A merged query object.
 */
export function buildQuery<Q extends QueryParams>(
  initialQuery: Q,
  filters: Q,
  debouncedSearch: string
): Q {
  return {
    ...initialQuery,
    ...filters,
    // Prioritize debouncedSearch if it has a value, otherwise use searchQuery from filters
    searchQuery: debouncedSearch || filters.searchQuery,
  } as Q;
}

/**
 * Determines if a new fetch operation should be triggered.
 *
 * @param previousFetchedQuery The query object from the last successful fetch.
 * @param currentQuery The currently constructed query object.
 * @param forceFetch A boolean indicating if a fetch should be forced (e.g., on refresh).
 * @returns True if a fetch should occur, false otherwise.
 */
export function shouldFetch<Q extends QueryParams>(
  previousFetchedQuery: Q | null,
  currentQuery: Q,
  forceFetch: boolean
): boolean {
  if (forceFetch) {
    return true;
  }
  // If there's no previous query, it's the first fetch.
  if (!previousFetchedQuery) {
    return true;
  }
  // Otherwise, only fetch if the query content has actually changed.
  return !shallowEqual(previousFetchedQuery, currentQuery);
}
