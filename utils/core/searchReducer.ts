// gia-pha-viet-app/utils/core/searchReducer.ts

import { QueryParams } from "./queryUtils";

export interface SearchReducerState<Q extends QueryParams> {
  search: string;
  filters: Q;
  page: number;
}

export type SearchReducerAction<Q extends QueryParams> =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_FILTERS"; payload: Partial<Q> | ((prev: Q) => Partial<Q>) }
  | { type: "LOAD_MORE" }
  | { type: "RESET"; payload: Q };

export function searchReducer<Q extends QueryParams>(
  state: SearchReducerState<Q>,
  action: SearchReducerAction<Q>
): SearchReducerState<Q> {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload, page: 1 };

    case "SET_FILTERS":
      const newFilters = typeof action.payload === 'function' ? action.payload(state.filters) : action.payload;
      return { ...state, filters: { ...state.filters, ...newFilters } as Q, page: 1 };

    case "LOAD_MORE":
      return { ...state, page: state.page + 1 };

    case "RESET":
      return {
        ...state,
        search: action.payload.searchTerm || "",
        filters: action.payload,
        page: 1,
      };

    default:
      return state;
  }
}
