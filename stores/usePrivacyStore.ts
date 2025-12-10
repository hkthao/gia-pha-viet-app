// apps/mobile/family_tree_rn/stores/usePrivacyStore.ts

import { create, StateCreator } from 'zustand';
import { privacyService as defaultPrivacyService } from '@/services'; // Import the service with an alias
import { IPrivacyService } from '@/services'; // Import the service interface
import { PrivacyConfigurationDto, UpdatePrivacyConfigurationCommand } from '@/types/privacy';
import { parseError } from '@/utils/errorUtils';


// Define the state for the Privacy Store
interface PrivacyState {
  item: PrivacyConfigurationDto | null;
  loading: boolean;
  error: string | null;
}

// Define the actions for the Privacy Store
import { Result } from '@/types/api'; // Add this import

// Define the actions for the Privacy Store
interface PrivacyActions {
  get: (familyId: string) => Promise<Result<PrivacyConfigurationDto | null>>;
  update: (command: UpdatePrivacyConfigurationCommand) => Promise<Result<PrivacyConfigurationDto | null>>;
  setError: (error: string | null) => void;
  clearItem: () => void;
  reset: () => void;
}

// Combine state and actions to form the PrivacyStore type
export type PrivacyStore = PrivacyState & PrivacyActions;

// Factory function to create the Privacy Store
export const createPrivacyStore = (
  privacyService: IPrivacyService
): StateCreator<PrivacyStore> => (set) => ({
  item: null, // Renamed from privacyConfiguration
  loading: false,
  error: null,

  get: async (familyId: string): Promise<Result<PrivacyConfigurationDto | null>> => {
    set({ loading: true, error: null });
    try {
      const result = await privacyService.get(familyId);
      if (!result.isSuccess) {
        set({ error: parseError(result.error) });
      } else {
        set({ item: result.value }); // Updated
      }
      return result;
    } catch (err: any) {
      const error = parseError(err);
      set({ error });
      return { isSuccess: false, error: { message: error } };
    } finally {
      set({ loading: false });
    }
  },

  update: async (command: UpdatePrivacyConfigurationCommand): Promise<Result<PrivacyConfigurationDto | null>> => {
    set({ loading: true, error: null });
    try {
      const result = await privacyService.update(command);
      if (!result.isSuccess) {
        set({ error: parseError(result.error) });
      } else {
        set({ item: result.value }); // Updated
      }
      return result;
    } catch (err: any) {
      const error = parseError(err);
      set({ error });
      return { isSuccess: false, error: { message: error } };
    } finally {
      set({ loading: false });
    }
  },

  setError: (error: string | null) => set({ error }),
  clearItem: () => set({ item: null }), // Renamed from clearPrivacyConfiguration
  reset: () => set({ item: null, loading: false, error: null }), // Updated
});

// Export default store instance
export const usePrivacyStore = create<PrivacyStore>(createPrivacyStore(defaultPrivacyService));
