import { FamilyRole } from '@/types';
import { useGetMyAccessFamiliesQuery } from '@/hooks/family/useFamilyQueries'; // Import useGetMyAccessFamiliesQuery
import { useGetCurrentUserProfileQuery } from '@/hooks/user/useUserProfileQueries'; // Import useGetCurrentUserProfileQuery

/**
 * Hook to check user permissions for a given family or system role.
 *
 * @param familyId Optional: The ID of the family to check permissions for.
 * @returns An object with permission checking functions.
 */
export const usePermissionCheck = (familyId?: string) => {
  const { data: userProfile } = useGetCurrentUserProfileQuery(); // Get userProfile from useGetCurrentUserProfileQuery
  const currentUserId = userProfile?.userId; // Use userProfile.userId for the application's internal user ID
  const { data: accessData } = useGetMyAccessFamiliesQuery();

  const isAdmin = userProfile?.roles.includes("Admin");

  const checkFamilyRole = (role: FamilyRole): boolean => {
    if (!familyId) {
      console.warn("usePermissionCheck: familyId is required for checking family roles.");
      return false;
    }
    if (!currentUserId || !accessData) { // Check if accessData is available
      return false;
    }
    const hasPermission = accessData.some(access => {
      // If the requested role is Viewer, and the user is Manager, they also have Viewer permissions.
      const hasViewerAccessByManager = (role === FamilyRole.Viewer && access.role === FamilyRole.Manager);
      
      return access.familyId === familyId &&
             access.userId === currentUserId &&
             (access.role === role || hasViewerAccessByManager);
    });
    return hasPermission;
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
