// apps/mobile/family_tree_rn/stores/useUserProfileStore.ts

import { create, StateCreator } from 'zustand';
import { UserProfileDto } from '@/types'; // Import from central types index
import { userProfileService as defaultUserProfileService } from '@/services'; // Import the userProfileService
import { IUserProfileService } from '@/services'; // Import IUserProfileService from '@/services'
import { parseError } from '@/utils/errorUtils';

interface UserProfileState {
  userProfile: UserProfileDto | null;
  loading: boolean;
  error: string | null;
}

interface UserProfileActions {
  fetchUserProfile: () => Promise<void>;
  clearUserProfile: () => void;
  reset: () => void; // Add reset action
  setError: (error: string | null) => void;
}

export type UserProfileStore = UserProfileState & UserProfileActions;

// Factory function to create the store
export const createUserProfileStore = (
  userProfileService: IUserProfileService
): StateCreator<UserProfileStore> => (set) => ({
  userProfile: null,
  loading: false,
  error: null,

  fetchUserProfile: async () => {
    set(state => ({ ...state, loading: true, error: null }));
    try {
      const result = await userProfileService.getCurrentUserProfile();
      if (result.isSuccess && result.value) {
        set(state => ({ ...state, userProfile: result.value, loading: false }));
      } else {
        const errorMessage = parseError(result.error);
        set(state => ({ ...state, error: errorMessage, loading: false }));
      }
    } catch (err: any) {
      const errorMessage = parseError(err);
      set(state => ({ ...state, error: errorMessage, loading: false }));
    }
  },

  clearUserProfile: () => set(state => ({ ...state, userProfile: null, error: null })),
  reset: () => set({ userProfile: null, loading: false, error: null }), // Full reset
  setError: (error: string | null) => set(state => ({ ...state, error })),
});

// Export default store instance
export const useUserProfileStore = create<UserProfileStore>(createUserProfileStore(defaultUserProfileService));