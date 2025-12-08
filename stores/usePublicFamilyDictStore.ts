import { create, StateCreator } from 'zustand';
import { familyDictService as defaultFamilyDictService } from '@/services'; // Import the new familyDictService
import { IFamilyDictService } from '@/services'; // Import IFamilyDictService from '@/services'
import type { FamilyDictDto, PaginatedList, FamilyDictFilter } from '@/types';
import { parseError } from '@/utils/errorUtils';

const PAGE_SIZE = 10;

interface PublicFamilyDictState {
  familyDict: FamilyDictDto | null;
  familyDicts: FamilyDictDto[];
  totalItems: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

interface PublicFamilyDictActions {
  getFamilyDictById: (id: string) => Promise<void>;
  fetchFamilyDicts: (filter: FamilyDictFilter, page: number, itemsPerPage: number, isRefreshing?: boolean) => Promise<PaginatedList<FamilyDictDto> | null>;
  clearFamilyDict: () => void;
  reset: () => void;
  setError: (error: string | null) => void;
}

export type PublicFamilyDictStore = PublicFamilyDictState & PublicFamilyDictActions;

// Factory function to create the store
export const createPublicFamilyDictStore = (
  familyDictService: IFamilyDictService
): StateCreator<PublicFamilyDictStore> => (set, get) => ({
  familyDict: null,
  familyDicts: [],
  totalItems: 0,
  page: 1,
  totalPages: 0,
  loading: false,
  error: null,
  hasMore: true,

  getFamilyDictById: async (id: string) => {
    set(state => ({ ...state, loading: true, error: null }));
    try {
      const result = await familyDictService.getFamilyDictById(id);
      if (result.isSuccess && result.value) {
        set(state => ({ ...state, familyDict: result.value, loading: false }));
      } else {
        const errorMessage = parseError(result.error);
        set(state => ({ ...state, error: errorMessage, loading: false }));
      }
    } catch (err: any) {
      const errorMessage = parseError(err);
      set(state => ({ ...state, error: errorMessage, loading: false }));
    }
  },

  fetchFamilyDicts: async (filter: FamilyDictFilter, page: number, itemsPerPage: number, isRefreshing: boolean = false): Promise<PaginatedList<FamilyDictDto> | null> => {
    set(state => ({ ...state, loading: true, error: null }));
    try {
      const result = await familyDictService.getFamilyDicts(filter, page, itemsPerPage);
      if (result.isSuccess && result.value) {
        const paginatedList: PaginatedList<FamilyDictDto> = result.value;

        set((state) => ({
          familyDicts: isRefreshing ? paginatedList.items : [...state.familyDicts, ...paginatedList.items],
          totalItems: paginatedList.totalItems,
          page: paginatedList.page,
          totalPages: paginatedList.totalPages,
          hasMore: paginatedList.totalPages > 0 && paginatedList.page < paginatedList.totalPages,
          loading: false,
        }));
        return paginatedList;
      } else {
        const errorMessage = parseError(result.error);
        set(state => ({ ...state, error: errorMessage, loading: false }));
        return null;
      }
    } catch (err: any) {
      const errorMessage = parseError(err);
      set(state => ({ ...state, error: errorMessage, loading: false }));
      return null;
    }
  },

  clearFamilyDict: () => set(state => ({ ...state, familyDict: null })),
  reset: () => set({ familyDicts: [], totalItems: 0, page: 1, totalPages: 0, hasMore: true, familyDict: null, loading: false, error: null }),
  setError: (error: string | null) => set(state => ({ ...state, error })),
});

// Export default store instance
export const usePublicFamilyDictStore = create<PublicFamilyDictStore>(createPublicFamilyDictStore(defaultFamilyDictService));