import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useTheme, Text, Checkbox, Button, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useIsFocused } from '@react-navigation/native';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { usePrivacyStore } from '@/stores/usePrivacyStore'; 
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
  
  const showSnackbar = useCallback((message: string, type: 'success' | 'error') => {
    console.log(`Snackbar (${type}): ${message}`);
  }, []); 

  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);
      const {
      item, // Renamed from privacyConfiguration 
      loading,
      error,
      get, 
      update, 
    } = usePrivacyStore();
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

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
      setInitialLoadComplete(false);
      // Only call get, and let the store update 'item'.
      // The update to setSelectedProperties will happen in a separate effect
      // that reacts to changes in 'item'.
      await get(currentFamilyId); 
      setInitialLoadComplete(true); // Set true after initiating fetch
    };

    fetchSettings();
  }, [currentFamilyId, isFocused, get, t]); // Only depend on currentFamilyId, isFocused, get, and t

  // Effect to react to changes in 'item' (from store) and 'error' (from store)
  useEffect(() => {
    if (initialLoadComplete) { // Only run once initial fetch attempt is done
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
    }
  }, [item, error, initialLoadComplete, memberProperties, showSnackbar, t]);

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
    const result: Result<PrivacyConfigurationDto | null> = await update(command); 
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
    propertyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPACING_SMALL,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    propertyName: {
      color: theme.colors.onSurface,
    },
    saveButton: {
      marginTop: SPACING_MEDIUM,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
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

        {loading && !initialLoadComplete && (
          <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
        )}

        {!loading && initialLoadComplete && (
          <>
            {memberProperties.map((prop) => (
              <View key={prop.value} style={styles.propertyItem}>
                <Text style={styles.propertyName}>{prop.text}</Text>
                <Checkbox
                  status={selectedProperties.includes(prop.value) ? 'checked' : 'unchecked'}
                  onPress={() => handleToggleProperty(prop.value)}
                />
              </View>
            ))}
            <Button
              mode="contained"
              onPress={savePrivacySettings}
              loading={loading}
              disabled={loading}
              style={styles.saveButton}
            >
              {t('common.save')}
            </Button>
          </>
        )}
      </ScrollView>
      {loading && initialLoadComplete && ( 
        <View style={styles.loadingOverlay}>
          <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
        </View>
      )}
    </View>
  );
};

export default PrivacyScreen;