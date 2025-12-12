import { useFamilyStore } from '@/stores/useFamilyStore';

/**
 * Custom hook to get the current family ID from the global family store.
 * @returns The current family ID or null if not set.
 */
export const useCurrentFamilyId = (): string | null => {
  return useFamilyStore((state) => state.currentFamilyId);
};
