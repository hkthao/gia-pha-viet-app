import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useCurrentFamilyId } from '@/hooks/family/useCurrentFamilyId';
import { usePrivacyStore } from '@/stores/usePrivacyStore';
import { usePermissionCheck } from '@/hooks/permissions/usePermissionCheck';
import { PrivacyConfigurationDto, UpdatePrivacyConfigurationCommand } from '@/types/privacy';
import { useApiMutation } from '@/hooks/common/useApiMutation'; // Import useApiMutation

interface MemberProperty {
  text: string;
  value: string;
}

export interface UseFamilyPrivacySettingsResult {
  hasPermit: boolean;
  loading: boolean;
  error: string | null;
  selectedProperties: string[];
  memberProperties: MemberProperty[];
  getIconNameForProperty: (propertyValue: string) => string;
  handleToggleProperty: (value: string) => void;
  savePrivacySettings: () => Promise<void>;
}

export function useFamilyPrivacySettings(): UseFamilyPrivacySettingsResult {
  const { t } = useTranslation();
  const isFocused = useIsFocused();

  const currentFamilyId = useCurrentFamilyId();
  const { canManageFamily, isAdmin } = usePermissionCheck(currentFamilyId ?? undefined);
  const hasPermit = !!(canManageFamily || isAdmin);

  const {
    item,
    loading,
    error,
    get,
    update,
  } = usePrivacyStore();
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  const getIconNameForProperty = useCallback((propertyValue: string): string => {
    switch (propertyValue) {
      case 'LastName':
      case 'FirstName':
        return 'account';
      case 'Gender':
        return 'gender-male-female';
      case 'DateOfBirth':
      case 'DateOfDeath':
        return 'calendar';
      case 'PlaceOfBirth':
      case 'PlaceOfDeath':
        return 'map-marker';
      case 'Phone':
        return 'phone';
      case 'Email':
        return 'email';
      case 'Address':
        return 'home-account';
      case 'Occupation':
        return 'briefcase';
      case 'Biography':
        return 'book-open';
      case 'FatherFullName':
      case 'MotherFullName':
      case 'HusbandFullName':
      case 'WifeFullName':
        return 'human-male-female';
      default:
        return 'form-textbox-password';
    }
  }, []);

  const memberProperties: MemberProperty[] = useMemo(() => ([
    { text: t('memberDetail.lastName'), value: 'LastName' },
    { text: t('memberDetail.firstName'), value: 'FirstName' },
    { text: t('memberDetail.nickname'), value: 'Nickname' },
    { text: t('member.gender'), value: 'Gender' },
    { text: t('memberDetail.dateOfBirth'), value: 'DateOfBirth' },
    { text: t('memberDetail.dateOfDeath'), value: 'DateOfDeath' },
    { text: t('memberDetail.placeOfBirth'), value: 'PlaceOfBirth' },
    { text: t('memberDetail.placeOfDeath'), value: 'PlaceOfDeath' },
    { text: t('memberDetail.phone'), value: 'Phone' },
    { text: t('memberDetail.email'), value: 'Email' },
    { text: t('memberDetail.address'), value: 'Address' },
    { text: t('memberDetail.occupation'), value: 'Occupation' },
    { text: t('memberDetail.biography'), value: 'Biography' },
    { text: t('member.fatherFullName'), value: 'FatherFullName' },
    { text: t('member.motherFullName'), value: 'MotherFullName' },
    { text: t('member.husbandFullName'), value: 'HusbandFullName' },
    { text: t('member.wifeFullName'), value: 'WifeFullName' },
  ]), [t]);


  useEffect(() => {
    if (!currentFamilyId || !isFocused) {
      return;
    }

    const fetchSettings = async () => {
      if (!currentFamilyId) {
        Alert.alert(t('common.error'), t('family.privacy.noFamilyIdError'));
        return;
      }
      // showLoading(); // Handled by useApiMutation if showLoadingOverlay is true
      await get(currentFamilyId);
      // hideLoading(); // Handled by useApiMutation
    };

    fetchSettings();
  }, [currentFamilyId, isFocused, get, t]); // Removed showLoading, hideLoading

  useEffect(() => {
    if (item) {
      setSelectedProperties(item.publicMemberProperties);
    } else {
      if (!error) {
        setSelectedProperties(memberProperties.map(p => p.value));
      } else {
        // showSnackbar(t('family.privacy.fetchError'), 'error'); // Handled by useApiMutation
        setSelectedProperties(memberProperties.map(p => p.value));
      }
    }
  }, [item, error, memberProperties, t]); // Removed showSnackbar

  const handleToggleProperty = useCallback((value: string) => {
    setSelectedProperties((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  }, []);

  const { mutate: saveSettings, isPending: isSavingSettings } = useApiMutation<PrivacyConfigurationDto | null, Error, UpdatePrivacyConfigurationCommand>(
    async (command: UpdatePrivacyConfigurationCommand) => {
      const result = await update(command);
      if (result.isSuccess) {
        return (result.value === undefined) ? null : result.value;
      }
      throw new Error(result.error?.message || t('family.privacy.saveError'));
    },
    {
      successMessageKey: 'family.privacy.saveSuccess',
      errorMessageKey: 'family.privacy.saveError',
      showLoadingOverlay: true,
      onSuccess: () => {
        // Optionally invalidate queries here
      },
      onError: (err: Error) => {
        console.error('Error saving privacy settings:', err);
      },
    }
  );

  const savePrivacySettings = useCallback(async () => {
    if (!currentFamilyId) {
      // showSnackbar(t('family.privacy.noFamilyIdError'), 'error'); // Handled by useApiMutation if mutationFn throws
      return;
    }
    const command: UpdatePrivacyConfigurationCommand = {
      familyId: currentFamilyId,
      publicMemberProperties: selectedProperties,
    };
    await saveSettings(command);
  }, [currentFamilyId, selectedProperties, saveSettings]);

  return {
    hasPermit,
    loading: loading || isSavingSettings, // Combine loading states
    error,
    selectedProperties,
    memberProperties,
    getIconNameForProperty,
    handleToggleProperty,
    savePrivacySettings,
  };
}
