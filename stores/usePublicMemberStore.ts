// apps/mobile/family_tree_rn/stores/usePublicMemberStore.ts

import { create, StateCreator } from 'zustand';
import { memberService as defaultMemberService } from '@/services'; // Import the new memberService
import { IMemberService } from '@/services'; // Import IMemberService from '@/services'
import type { MemberListDto, SearchPublicMembersQuery, MemberDetailDto, PaginatedList } from '@/types';
import { parseError } from '@/utils/errorUtils';


interface PublicMemberState {
  member: MemberDetailDto | null; // Added for member details
  members: MemberListDto[];
  page: number;
  totalPages: number;
  totalItems: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

interface PublicMemberActions {
  getMemberById: (id: string, familyId: string) => Promise<MemberDetailDto | null>; // Added for member details
  fetchMembers: (query: SearchPublicMembersQuery, isRefreshing?: boolean) => Promise<PaginatedList<MemberListDto> | null>;
  reset: () => void;
  setError: (error: string | null) => void;
}

export type PublicMemberStore = PublicMemberState & PublicMemberActions;

// Factory function to create the store
export const createPublicMemberStore = (
  memberService: IMemberService
): StateCreator<PublicMemberStore> => (set, get) => ({
  member: null, // Initialize member
  members: [],
  page: 1,
  totalPages: 0,
  totalItems: 0,
  loading: false,
  error: null,
  hasMore: true,

  getMemberById: async (id: string, familyId: string) => {
    set(state => ({ ...state, loading: true, error: null }));
    try {
      const result = await memberService.getMemberById(id, familyId);
      if (result.isSuccess && result.value) {
        set(state => ({ ...state, member: result.value }));
        return result.value;
      } else {
        const errorMessage = parseError(result.error);
        set(state => ({ ...state, error: errorMessage }));
        return null;
      }
    } catch (err: any) {
      const errorMessage = parseError(err);
      set(state => ({ ...state, error: errorMessage }));
      return null;
    } finally {
      set(state => ({ ...state, loading: false }));
    }
  },

  fetchMembers: async (query: SearchPublicMembersQuery, isRefreshing: boolean = false): Promise<PaginatedList<MemberListDto> | null> => {
    set(state => ({ ...state, loading: true, error: null }));
    try {
      const result = await memberService.searchMembers(query);
      if (result.isSuccess && result.value) {
        const paginatedList: PaginatedList<MemberListDto> = result.value;
        set((state) => ({
          members: isRefreshing ? paginatedList.items : [...state.members, ...paginatedList.items],
          totalItems: paginatedList.totalItems,
          page: paginatedList.page,
          totalPages: paginatedList.totalPages,
          hasMore: paginatedList.totalPages > 0 && paginatedList.page < paginatedList.totalPages,
        }));
        return paginatedList;
      } else {
        const errorMessage = parseError(result.error);
        set(state => ({ ...state, error: errorMessage }));
        return null;
      }
    } catch (err: any) {
      const errorMessage = parseError(err);
      set(state => ({ ...state, error: errorMessage }));
      return null;
    } finally {
      set(state => ({ ...state, loading: false }));
    }
  },

  reset: () => set({ member: null, members: [], page: 1, totalPages: 0, totalItems: 0, loading: false, error: null, hasMore: true }),
  setError: (error: string | null) => set(state => ({ ...state, error })),
});

// Export default store instance
export const usePublicMemberStore = create<PublicMemberStore>(createPublicMemberStore(defaultMemberService));
