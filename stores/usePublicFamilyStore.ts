// apps/mobile/family_tree_rn/stores/usePublicFamilyStore.ts

import { create, StateCreator } from 'zustand';
import { familyService as defaultFamilyService } from '@/services'; // Import the new familyService
import { IFamilyService } from '@/services'; // Import IFamilyService from '@/services'
import type { FamilyDetailDto, FamilyListDto, PaginatedList } from '@/types';
import { parseError } from '@/utils/errorUtils';

const PAGE_SIZE = 10; // Define PAGE_SIZE here

interface PublicFamilyState {
  family: FamilyDetailDto | null;
  families: FamilyListDto[]; // Changed to array for accumulation
  totalItems: number; // Added for pagination
  page: number; // Added
  totalPages: number; // Added
  loading: boolean;
  error: string | null;
  hasMore: boolean; // Add hasMore property
}

interface PublicFamilyActions {
  getFamilyById: (id: string) => Promise<void>;
  fetchFamilies: (query: { page: number; search?: string }, isRefreshing?: boolean) => Promise<PaginatedList<FamilyListDto> | null>;
  clearFamily: () => void;
  reset: () => void;
  setError: (error: string | null) => void;
}

export type PublicFamilyStore = PublicFamilyState & PublicFamilyActions;

// Factory function to create the store
export const createPublicFamilyStore = (
  familyService: IFamilyService
): StateCreator<PublicFamilyStore> => (set, get) => ({
  family: null,
  families: [], // Initialize as empty array
  totalItems: 0, // Initialize totalItems
  page: 1, // Initialize page
  totalPages: 0, // Initialize totalPages
  loading: false,
  error: null,
  hasMore: true, // Initialize hasMore to true as per requirement

  getFamilyById: async (id: string) => {
    set(state => ({ ...state, loading: true, error: null }));
    try {
      const result = await familyService.getFamilyById(id);
      if (result.isSuccess && result.value) {
        set(state => ({ ...state, family: result.value, loading: false }));
      } else {
        const errorMessage = parseError(result.error);
        set(state => ({ ...state, error: errorMessage, loading: false }));
      }
    } catch (err: any) {
      const errorMessage = parseError(err);
      set(state => ({ ...state, error: errorMessage, loading: false }));
    }
  },

  fetchFamilies: async (query: { page: number; search?: string }, isRefreshing: boolean = false): Promise<PaginatedList<FamilyListDto> | null> => {
    console.log('fetchFamilies called with query:', query, 'isRefreshing:', isRefreshing);
    set(state => ({ ...state, loading: true, error: null }));
    try {
      const result = await familyService.searchFamilies({ // Updated type
        page: query.page,
        itemsPerPage: PAGE_SIZE, // Use PAGE_SIZE from FamilySearchScreen
        searchTerm: query.search,
      });

      if (result.isSuccess && result.value) {
        const paginatedList: PaginatedList<FamilyListDto> = result.value;
        console.log('fetchFamilies successful:', 'items count:', paginatedList.items.length, 'page:', paginatedList.page, 'totalItems:', paginatedList.totalItems);
        
        set((state) => ({
          families: isRefreshing ? paginatedList.items : [...(state.families || []), ...paginatedList.items],
          totalItems: paginatedList.totalItems,
          page: paginatedList.page,
          totalPages: paginatedList.totalPages,
          hasMore: paginatedList.totalPages > 0 && paginatedList.page < paginatedList.totalPages,
          loading: false,
        }));
        return paginatedList;
      } else {
        const errorMessage = parseError(result.error);
        console.error('fetchFamilies failed:', errorMessage);
        set(state => ({ ...state, error: errorMessage, loading: false }));
        return null;
      }
    } catch (err: any) {
      const errorMessage = parseError(err);
      console.error('fetchFamilies caught exception:', errorMessage);
      set(state => ({ ...state, error: errorMessage, loading: false }));
      return null;
    } finally {
      set(state => ({ ...state, loading: false })); // Ensure loading is always set to false
    }
  },

  clearFamily: () => set(state => ({ ...state, family: null })),
  reset: () => set({ families: [], totalItems: 0, page: 1, totalPages: 0, loading: false, error: null, family: null, hasMore: true }), // Renamed and set hasMore to true
  setError: (error: string | null) => set(state => ({ ...state, error })),
});

// Export default store instance
export const usePublicFamilyStore = create<PublicFamilyStore>(createPublicFamilyStore(defaultFamilyService));