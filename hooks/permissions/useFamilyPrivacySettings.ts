import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar';
import { useLoadingOverlay } from '@/hooks/ui/useLoadingOverlay';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { usePrivacyStore } from '@/stores/usePrivacyStore';
import { usePermissionCheck } from '@/hooks/permissions/usePermissionCheck';
import { PrivacyConfigurationDto, UpdatePrivacyConfigurationCommand } from '@/types/privacy';
import { Result } from '@/types/api';

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

  const { showSnackbar } = useGlobalSnackbar();
  const { showLoading, hideLoading } = useLoadingOverlay();

  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);
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
      showLoading();
      await get(currentFamilyId);
      hideLoading();
    };

    fetchSettings();
  }, [currentFamilyId, isFocused, get, t, showLoading, hideLoading]);

  useEffect(() => {
    if (item) {
      setSelectedProperties(item.publicMemberProperties);
    } else {
      if (!error) {
        setSelectedProperties(memberProperties.map(p => p.value));
      } else {
        showSnackbar(t('family.privacy.fetchError'), 'error');
        setSelectedProperties(memberProperties.map(p => p.value));
      }
    }
  }, [item, error, memberProperties, showSnackbar, t]);

  const handleToggleProperty = useCallback((value: string) => {
    setSelectedProperties((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  }, []);

  const savePrivacySettings = useCallback(async () => {
    if (!currentFamilyId) {
      showSnackbar(t('family.privacy.noFamilyIdError'), 'error');
      return;
    }
    const command: UpdatePrivacyConfigurationCommand = {
      familyId: currentFamilyId,
      publicMemberProperties: selectedProperties,
    };
    showLoading();
    const result: Result<PrivacyConfigurationDto | null> = await update(command);
    hideLoading();
    if (result.isSuccess) {
      showSnackbar(t('family.privacy.saveSuccess'), 'success');
    } else {
      showSnackbar(t('family.privacy.saveError'), 'error');
      console.error('Error saving privacy settings:', result.error);
    }
  }, [currentFamilyId, selectedProperties, showSnackbar, showLoading, hideLoading, update, t]);

  return {
    hasPermit,
    loading,
    error,
    selectedProperties,
    memberProperties,
    getIconNameForProperty,
    handleToggleProperty,
    savePrivacySettings,
  };
}
