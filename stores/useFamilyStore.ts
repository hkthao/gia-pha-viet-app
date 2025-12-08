import { create, StateCreator } from 'zustand';

interface FamilyState {
  currentFamilyId: string | null;
}

interface FamilyActions {
  setCurrentFamilyId: (id: string | null) => void;
  reset: () => void;
}

export type FamilyStore = FamilyState & FamilyActions;

// Factory function to create the store
export const createFamilyStore = (): StateCreator<FamilyStore> => (set) => ({
  currentFamilyId: null,
  setCurrentFamilyId: (id) => set(state => ({ ...state, currentFamilyId: id })),
  reset: () => set({ currentFamilyId: null }),
});

// Export default store instance
export const useFamilyStore = create<FamilyStore>(createFamilyStore());