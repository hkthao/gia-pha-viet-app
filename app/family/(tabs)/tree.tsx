import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme, Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useFamilySharing } from '@/hooks/family/useFamilySharing'; // Import the new hook
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore'; // Import useCurrentFamilyStore

export default function FamilyTreeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const currentFamilyId = useCurrentFamilyStore((state) => state.currentFamilyId); // Get currentFamilyId from store
  const { onShare } = useFamilySharing();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    webview: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

  const familyDetailUrl = currentFamilyId ? `${process.env.EXPO_PUBLIC_APP_BASE_URL}/public/family-tree/${currentFamilyId}` : '';

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('familyDetail.tab.familyTreeShort')} />
        {currentFamilyId && (
          <Appbar.Action icon="share-variant" onPress={onShare} color={theme.colors.onSurface} />
        )}
      </Appbar.Header>
      {currentFamilyId ? (
        <WebView
          source={{ uri: familyDetailUrl }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      ) : (
        <Text variant="headlineMedium">{t('familyDetail.noFamilySelected')}</Text>
      )}
    </View>
  );
}
