// gia-pha-viet-app/stores/useCurrentFamilyStore.ts
import { create } from 'zustand';

interface CurrentFamilyState {
  currentFamilyId: string | null;
  setCurrentFamilyId: (familyId: string | null) => void;
}

export const useCurrentFamilyStore = create<CurrentFamilyState>((set) => ({
  currentFamilyId: null,
  setCurrentFamilyId: (familyId) => set({ currentFamilyId: familyId }),
}));