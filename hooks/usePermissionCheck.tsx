import { usePermissionStore } from '@/stores/usePermissionStore';
import { FamilyRole } from '@/types/family';
import { useAuth } from './useAuth';

/**
 * Hook to check user permissions for a given family or system role.
 *
 * @param familyId Optional: The ID of the family to check permissions for.
 * @returns An object with permission checking functions.
 */
export const usePermissionCheck = (familyId?: string) => {
  const { user, isAdmin } = useAuth(); // Get current user and system admin status from useAuth
  const currentUserId = user?.sub; // Use user.sub for Auth0 user ID

  const { hasFamilyRole: storeHasFamilyRole } = usePermissionStore(); // Only need hasFamilyRole from store

  const checkFamilyRole = (role: FamilyRole): boolean => {
    if (!familyId) {
      console.warn("usePermissionCheck: familyId is required for checking family roles.");
      return false;
    }
    if (!currentUserId) {
      console.warn("usePermissionCheck: currentUserId is required for checking family roles.");
      return false;
    }
    return storeHasFamilyRole(familyId, role, currentUserId);
  };

  // Convenience checks
  const canManageFamily = isAdmin || checkFamilyRole(FamilyRole.Manager);
  const canViewFamily = isAdmin || canManageFamily || checkFamilyRole(FamilyRole.Viewer)

  return {
    checkFamilyRole,
    canManageFamily,
    canViewFamily,
    isAdmin,
  };
};
