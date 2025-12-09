// gia-pha-viet-app/utils/core/searchReducer.ts

import { QueryParams } from "./queryUtils";

export interface SearchReducerState<Q extends QueryParams> {
  search: string;
  filters: Q;
  page: number;
  refreshing: boolean; // Add refreshing state
}

export type SearchReducerAction<Q extends QueryParams> =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_FILTERS"; payload: Partial<Q> | ((prev: Q) => Partial<Q>) }
  | { type: "LOAD_MORE" }
  | { type: "RESET"; payload: Q }
  | { type: "START_REFRESH" } // New action
  | { type: "END_REFRESH" }; // New action

export function searchReducer<Q extends QueryParams>(
  state: SearchReducerState<Q>,
  action: SearchReducerAction<Q>
): SearchReducerState<Q> {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload, page: 1 };

    case "SET_FILTERS":
      const newPartialFilters = typeof action.payload === 'function' ? action.payload(state.filters) : action.payload;
      const mergedFilters: Q = { ...state.filters, ...newPartialFilters } as Q;

      // Shallow comparison to determine if filters have actually changed
      const filtersHaveChanged = Object.keys(mergedFilters).length !== Object.keys(state.filters).length ||
                                 Object.keys(mergedFilters).some(key => mergedFilters[key] !== state.filters[key]);

      if (!filtersHaveChanged && state.page === 1) {
        return state; // No effective change in filters and page is already 1, return current state
      }

      return { ...state, filters: mergedFilters, page: 1 };

    case "LOAD_MORE":
      return { ...state, page: state.page + 1 };

    case "RESET":
      return {
        ...state,
        search: action.payload.searchQuery || "",
        filters: action.payload,
        page: 1,
        refreshing: false, // Reset refreshing state on full reset
      };

    case "START_REFRESH": // Handle new action
      return { ...state, refreshing: true };

    case "END_REFRESH": // Handle new action
      return { ...state, refreshing: false };

    default:
      return state;
  }
}
