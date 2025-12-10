import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { List, useTheme, Divider, Card } from 'react-native-paper'; // Import Appbar
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';

export default function MoreOptionsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: SPACING_MEDIUM,
      paddingVertical: SPACING_MEDIUM / 2,
    },
    listSection: {
      marginTop: SPACING_MEDIUM,
      padding: SPACING_SMALL,
      borderRadius: theme.roundness
    },
    listSubheader: {
      paddingLeft: SPACING_MEDIUM,
    },
    listItem: {
      paddingRight: SPACING_MEDIUM, 
      paddingStart: SPACING_MEDIUM,
      borderRadius: theme.roundness,
    },
    listIcon: {
    }
  });

  const navigateTo = (path: string) => {
    router.navigate(path as any);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.listSection}>
        <List.Subheader style={styles.listSubheader}>{t('more.data')}</List.Subheader>
        <List.Item
          title={t('more.calendar')}
          left={() => <MaterialCommunityIcons name="calendar-month-outline" size={24} color={theme.colors.onSurfaceVariant} style={styles.listIcon} />}
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => navigateTo('/family/more/calendar')}
          style={styles.listItem}
        />
        <Divider />
        <List.Item
          title={t('more.faceData')}
          left={() => <MaterialCommunityIcons name="face-recognition" size={24} color={theme.colors.onSurfaceVariant} style={styles.listIcon} />}
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => navigateTo('/family/more/face-data')}
          style={styles.listItem}
        />
        <Divider />
        <List.Item
          title={t('more.memories')}
          left={() => <MaterialCommunityIcons name="image-multiple-outline" size={24} color={theme.colors.onSurfaceVariant} style={styles.listIcon} />}
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => navigateTo('/family/more/memories')}
          style={styles.listItem}
        />
        <Divider />
        <List.Item
          title={t('more.timeline')}
          left={() => <MaterialCommunityIcons name="timeline-text-outline" size={24} color={theme.colors.onSurfaceVariant} style={styles.listIcon} />}
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => navigateTo('/family/more/timeline')}
          style={styles.listItem}
        />
      </Card>

      <Card style={styles.listSection}>
        <List.Subheader style={styles.listSubheader}>{t('more.privacy')}</List.Subheader>
        <List.Item
          title={t('more.privacyPolicy')}
          left={() => <MaterialCommunityIcons name="shield-lock-outline" size={24} color={theme.colors.onSurfaceVariant} style={styles.listIcon} />}
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => navigateTo('/family/more/privacy')}
          style={styles.listItem}
        />
      </Card>

      <Card style={styles.listSection}>
        <List.Subheader style={styles.listSubheader}>{t('more.tools')}</List.Subheader>
        <List.Item
          title={t('more.relationships')}
          left={() => <MaterialCommunityIcons name="family-tree" size={24} color={theme.colors.onSurfaceVariant} style={styles.listIcon} />}
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => navigateTo('/family/more/detect-relationship')}
          style={styles.listItem}
        />
      </Card>
    </ScrollView>
  );
}
