import { useMemo } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { useFamilyDetails } from '@/hooks/family/useFamilyDetails';
import { usePermissionCheck } from '@/hooks/permissions/usePermissionCheck'; // Import usePermissionCheck
import { SPACING_MEDIUM } from '@/constants/dimensions';

export function useFamilyDetailsActions() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  const { family, isLoading, isError, error } = useFamilyDetails();
  const { canManageFamily, isAdmin } = usePermissionCheck(family?.id); // Use the existing permission hook

  const canEditOrDelete = useMemo(() => {
    return canManageFamily || isAdmin;
  }, [canManageFamily, isAdmin]);

  const handleEditFamily = () => {
    if (family?.id) {
      router.push(`/family/create?id=${family.id}`);
    }
  };

  const handleDeleteFamily = () => {
    if (family?.id) {
      Alert.alert(
        t('familyDetail.delete.confirmTitle'),
        t('familyDetail.delete.confirmMessage', { familyName: family.name }),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () => {
              // TODO: Implement actual delete API call
              console.log(`Deleting family with ID: ${family.id}`);
              Alert.alert(t('familyDetail.delete.successTitle'), t('familyDetail.delete.successMessage'));
              router.back();
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  return {
    family,
    isLoading,
    isError,
    error,
    canEditOrDelete, // Now derived from canManageFamily and isAdmin
    handleEditFamily,
    handleDeleteFamily,
  };
}