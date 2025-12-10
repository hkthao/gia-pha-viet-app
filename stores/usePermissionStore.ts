import { create, StateCreator } from 'zustand';
import { IFamilyService, familyService as defaultFamilyService } from '@/services'; // Updated import for familyService
import { FamilyRole, FamilyUserDto } from '@/types'; // Import FamilyRole and FamilyUserDto from types/family
import { parseError } from '@/utils/errorUtils';
import { Result } from '@/types/api';

// Removed direct access to useAuth.getState()
// The userId is now a required parameter for hasFamilyRole.
// System roles will be checked via useAuth in usePermissionCheck.

interface PermissionState {
  accessData: FamilyUserDto[] | null;
  loading: boolean;
  error: string | null;
  lastLoaded: number | null;
}

interface PermissionActions {
  loadMyAccess: () => Promise<Result<FamilyUserDto[] | null>>;
  hasFamilyRole: (familyId: string, role: FamilyRole, userId: string) => boolean;
  clearPermissions: () => void;
  reset: () => void;
}

export type PermissionStore = PermissionState & PermissionActions;

export const createPermissionStore = (
  familyService: IFamilyService // Change parameter name and type
): StateCreator<PermissionStore> => (set, get) => {

  return {
    accessData: null,
    loading: false,
    error: null,
    lastLoaded: null,

    loadMyAccess: async (): Promise<Result<FamilyUserDto[] | null>> => {
      set({ loading: true, error: null });
      try {
        const result = await familyService.getMyAccess(); // Call familyService.getMyAccess()
        if (result.isSuccess) {
          set({ accessData: result.value, lastLoaded: Date.now() });
          return { isSuccess: true, value: result.value };
        } else {
          const errorMessage = parseError(result.error);
          set({ error: errorMessage });
          return { isSuccess: false, error: { message: errorMessage } };
        }
      } catch (err: any) {
        const errorMessage = parseError(err);
        set({ error: errorMessage });
        return { isSuccess: false, error: { message: errorMessage } };
      } finally {
        set({ loading: false });
      }
    },

    hasFamilyRole: (familyId: string, role: FamilyRole, userId: string): boolean => {
      const { accessData } = get();
      if (!accessData) return false;
      const hasPermission = accessData.some(access => {
        // If the requested role is Viewer, and the user is Manager, they also have Viewer permissions.
        const hasViewerAccessByManager = (role === FamilyRole.Viewer && access.role === FamilyRole.Manager);
        
        return access.familyId === familyId &&
               access.userId === userId &&
               (access.role === role || hasViewerAccessByManager);
      });
      return hasPermission;
    },
    clearPermissions: () => set({ accessData: null, error: null, lastLoaded: null }),
    reset: () => set({ accessData: null, loading: false, error: null, lastLoaded: null }),
  };
};

export const usePermissionStore = create<PermissionStore>(createPermissionStore(defaultFamilyService));
