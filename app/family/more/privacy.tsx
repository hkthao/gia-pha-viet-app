import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useTheme, Text, List, Switch, Button, Icon } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useIsFocused } from '@react-navigation/native';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar';
import { useLoadingOverlay } from '@/hooks/ui/useLoadingOverlay';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { usePrivacyStore } from '@/stores/usePrivacyStore';
import { usePermissionCheck } from '@/hooks/permissions/usePermissionCheck';
import { PrivacyConfigurationDto, UpdatePrivacyConfigurationCommand } from '@/types/privacy';
import { Result } from '@/types/api';

interface MemberProperty {
  text: string;
  value: string;
}

const PrivacyScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isFocused = useIsFocused();

  const { showSnackbar } = useGlobalSnackbar();
  const { showLoading, hideLoading } = useLoadingOverlay();

  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);
  const { canManageFamily, isAdmin } = usePermissionCheck(currentFamilyId ?? undefined); // Check permissions for the current family, ensure undefined for null
  const hasPermit = canManageFamily || isAdmin;

  const {
    item, // Renamed from privacyConfiguration 
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
        return 'form-textbox-password'; // Generic privacy icon
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
      showLoading(); // Show global loading overlay
      await get(currentFamilyId);
      hideLoading(); // Hide global loading overlay
    };

    fetchSettings();
  }, [currentFamilyId, isFocused, get, t, showLoading, hideLoading]); // Add showLoading and hideLoading to dependencies

  // Effect to react to changes in 'item' (from store) and 'error' (from store)
  useEffect(() => {
    if (item) {
      setSelectedProperties(item.publicMemberProperties);
    } else {
      // If item is null after fetch, means no config exists or error occurred
      if (!error) { // No error from store, so item being null means no config
        setSelectedProperties(memberProperties.map(p => p.value));
      } else { // Error from store
        showSnackbar(t('family.privacy.fetchError'), 'error');
        // setError is already handled by the store
        setSelectedProperties(memberProperties.map(p => p.value)); // Fallback on error
      }
    }
  }, [item, error, memberProperties, showSnackbar, t]);

  const handleToggleProperty = useCallback((value: string) => {
    setSelectedProperties((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  }, []);

  const savePrivacySettings = async () => {
    if (!currentFamilyId) {
      showSnackbar(t('family.privacy.noFamilyIdError'), 'error');
      return;
    }
    const command: UpdatePrivacyConfigurationCommand = {
      familyId: currentFamilyId,
      publicMemberProperties: selectedProperties,
    };
    showLoading(); // Show global loading overlay
    const result: Result<PrivacyConfigurationDto | null> = await update(command);
    hideLoading(); // Hide global loading overlay
    if (result.isSuccess) {
      showSnackbar(t('family.privacy.saveSuccess'), 'success');
    } else {
      showSnackbar(t('family.privacy.saveError'), 'error');
      console.error('Error saving privacy settings:', result.error);
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flexGrow: 1,
      padding: SPACING_MEDIUM,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: SPACING_MEDIUM,
      color: theme.colors.onBackground,
    },
    infoText: {
      fontSize: 16,
      marginBottom: SPACING_MEDIUM,
      color: theme.colors.onBackground,
    },
    card: {
      marginTop: SPACING_MEDIUM,
      borderRadius: theme.roundness,
      backgroundColor: theme.colors.surface,
      elevation: 2, // For Android shadow
      shadowColor: theme.colors.onSurface, // For iOS shadow
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
    listSectionStyle: { // Style for List.Section
      marginHorizontal: 0, // Remove default horizontal margin
      paddingHorizontal: 0, // Remove default horizontal padding
      paddingVertical: 0, // Remove default vertical padding
    },
    listItem: {
      backgroundColor: theme.colors.surface, // Background for list items
      borderBottomWidth: StyleSheet.hairlineWidth, // Thin line between items
      borderBottomColor: theme.colors.outlineVariant,
      paddingInlineStart: SPACING_MEDIUM
    },
    saveButton: {
      marginTop: SPACING_MEDIUM,
      borderRadius: theme.roundness,
    },
  }), [theme]);

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t('family.privacy.title')}</Text>
        <Text style={styles.infoText}>{t('family.privacy.description')}</Text>
        {error && (
          <Text style={{ color: theme.colors.error, marginBottom: SPACING_MEDIUM }}>
            {error}
          </Text>
        )}
        <View style={styles.card}>
          <List.Section title={t('family.privacy.propertyVisibility')} style={styles.listSectionStyle}>
            {memberProperties.map((prop, index) => (
              <List.Item
                key={prop.value}
                title={prop.text}
                left={() => <Icon source={getIconNameForProperty(prop.value)} size={24} color={theme.colors.onSurfaceVariant} />}
                right={() => (
                  <Switch
                    value={selectedProperties.includes(prop.value)}
                    onValueChange={() => handleToggleProperty(prop.value)}
                    disabled={!hasPermit} // Disable if not manager or admin
                  />
                )}
                // Apply custom style for List.Item to include bottom border, except for the last item
                style={[
                  styles.listItem,
                  index === memberProperties.length - 1 && { borderBottomWidth: 0 } // Remove border for last item
                ]}
              />
            ))}
          </List.Section>
        </View>
        {hasPermit && ( // Conditionally render the button if hasPermit
          <Button
            mode="contained"
            onPress={savePrivacySettings}
            // The Button's loading prop is used to show a spinner on the button itself.
            // The global overlay handles blocking the UI.
            loading={loading} // Keep for button specific loading
            disabled={loading || !hasPermit} // Disable if not manager or admin
            style={styles.saveButton}
          >
            {t('common.save')}
          </Button>
        )}
      </ScrollView>
    </View>
  );
};

export default PrivacyScreen;