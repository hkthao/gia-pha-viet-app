// apps/mobile/family_tree_rn/stores/usePublicRelationshipStore.ts

import { create, StateCreator } from 'zustand';
import { relationshipService as defaultRelationshipService } from '@/services'; // Import the new relationshipService
import { IRelationshipService } from '@/services'; // Import IRelationshipService from '@/services'
import type { RelationshipListDto } from '@/types';
import { parseError } from '@/utils/errorUtils';

interface PublicRelationshipState {
  relationships: RelationshipListDto[];
  loading: boolean;
  error: string | null;
}

interface PublicRelationshipActions {
  getRelationshipsByFamilyId: (familyId: string) => Promise<void>;
  clearRelationships: () => void;
  reset: () => void; // Add reset action
  setError: (error: string | null) => void;
}

export type PublicRelationshipStore = PublicRelationshipState & PublicRelationshipActions;

// Factory function to create the store
export const createPublicRelationshipStore = (
  relationshipService: IRelationshipService
): StateCreator<PublicRelationshipStore> => (set) => ({
  relationships: [],
  loading: false,
  error: null,

  getRelationshipsByFamilyId: async (familyId: string) => {
    set(state => ({ ...state, loading: true, error: null }));
    try {
      const result = await relationshipService.getRelationshipsByFamilyId(familyId);
      if (result.isSuccess && result.value) {
        set(state => ({ ...state, relationships: result.value, loading: false }));
      } else {
        const errorMessage = parseError(result.error);
        set(state => ({ ...state, error: errorMessage, loading: false }));
      }
    } catch (err: any) {
      const errorMessage = parseError(err);
      set(state => ({ ...state, error: errorMessage, loading: false }));
    }
  },

  clearRelationships: () => set(state => ({ ...state, relationships: [] })),
  reset: () => set({ relationships: [], loading: false, error: null }), // Full reset
  setError: (error: string | null) => set(state => ({ ...state, error })),
});

// Export default store instance
export const usePublicRelationshipStore = create<PublicRelationshipStore>(createPublicRelationshipStore(defaultRelationshipService));