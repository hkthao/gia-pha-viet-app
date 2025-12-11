import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme, Text, List, Switch, Button, Icon } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import { useFamilyPrivacySettings } from '@/hooks/permissions/useFamilyPrivacySettings'; // Import the new hook

const PrivacyScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    hasPermit,
    loading,
    error,
    selectedProperties,
    memberProperties,
    getIconNameForProperty,
    handleToggleProperty,
    savePrivacySettings,
  } = useFamilyPrivacySettings();

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
                    disabled={!hasPermit}
                  />
                )}
                style={[
                  styles.listItem,
                  index === memberProperties.length - 1 && { borderBottomWidth: 0 }
                ]}
              />
            ))}
          </List.Section>
        </View>
        {hasPermit && (
          <Button
            mode="contained"
            onPress={savePrivacySettings}
            loading={loading}
            disabled={loading || !hasPermit}
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
