import { usePermissionStore } from '@/stores/usePermissionStore';
import { FamilyRole } from '@/types';
import { useAuth } from './useAuth'; // Assuming useAuth provides current user details, including system roles
import { useUserProfileStore } from '@/stores/useUserProfileStore'; // Import useUserProfileStore

/**
 * Hook to check user permissions for a given family or system role.
 *
 * @param familyId Optional: The ID of the family to check permissions for.
 * @returns An object with permission checking functions.
 */
export const usePermissionCheck = (familyId?: string) => {
  const { userProfile } = useUserProfileStore(); // Get userProfile from userProfileStore
  const currentUserId = userProfile?.userId; // Use userProfile.userId for the application's internal user ID
  const { hasFamilyRole: storeHasFamilyRole } = usePermissionStore(); // Only need hasFamilyRole from store

  const isAdmin = userProfile?.roles.includes("Admin");

  const checkFamilyRole = (role: FamilyRole): boolean => {
    if (!familyId) {
      console.warn("usePermissionCheck: familyId is required for checking family roles.");
      return false;
    }
    if (!currentUserId) {
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
    isAdmin: isAdmin
  };
};
