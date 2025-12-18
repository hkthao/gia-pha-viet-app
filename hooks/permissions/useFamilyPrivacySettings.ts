import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';


import { useCurrentFamilyId } from '@/hooks/family/useCurrentFamilyId';
import { usePermissionCheck } from '@/hooks/permissions/usePermissionCheck';
import { UpdatePrivacyConfigurationCommand } from '@/types/privacy';
import { useGetPrivacyConfigurationQuery, useUpdatePrivacyConfigurationMutation } from '@/hooks/privacy/usePrivacyQueries'; // Import react-query hooks


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


  const currentFamilyId = useCurrentFamilyId();
  const { canManageFamily, isAdmin } = usePermissionCheck(currentFamilyId ?? undefined);
  const hasPermit = !!(canManageFamily || isAdmin);

  const { data: privacyConfiguration, isLoading: privacyLoading, error: privacyQueryError } = useGetPrivacyConfigurationQuery(currentFamilyId || '');
  const privacyError = privacyQueryError || null; // Map error

  const { mutate: updatePrivacySettings, isPending: isSavingSettings, error: saveMutationError } = useUpdatePrivacyConfigurationMutation();

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
    if (privacyConfiguration) {
      setSelectedProperties(privacyConfiguration.publicMemberProperties);
    } else {
      if (!privacyError) { // If there's no privacy configuration and no fetch error, assume all properties are public by default for a new setup.
        setSelectedProperties(memberProperties.map(p => p.value));
      } else {
        // If there's an error fetching privacy config, set all properties as public by default
        setSelectedProperties(memberProperties.map(p => p.value));
      }
    }
  }, [privacyConfiguration, privacyError, memberProperties]);

  const handleToggleProperty = useCallback((value: string) => {
    setSelectedProperties((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  }, []);

  const savePrivacySettings = useCallback(async () => {
    if (!currentFamilyId) {
      return;
    }
    const command: UpdatePrivacyConfigurationCommand = {
      familyId: currentFamilyId,
      publicMemberProperties: selectedProperties,
    };
    await updatePrivacySettings(command);
  }, [currentFamilyId, selectedProperties, updatePrivacySettings]);

  return {
    hasPermit,
    loading: privacyLoading || isSavingSettings,
    error: privacyError || saveMutationError,
    selectedProperties,
    memberProperties,
    getIconNameForProperty,
    handleToggleProperty,
    savePrivacySettings,
  };
}
