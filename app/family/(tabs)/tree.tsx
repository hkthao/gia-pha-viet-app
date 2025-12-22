import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme, Appbar, ActivityIndicator, Portal, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useFamilySharing } from '@/hooks/family/useFamilySharing';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore';
import { useFamilyTreeData } from '@/hooks/family/useFamilyTreeData'; // Import the new custom hook

export default function FamilyTreeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const currentFamilyId = useCurrentFamilyStore((state) => state.currentFamilyId); // Get currentFamilyId from store
  const { onShare } = useFamilySharing();

  const {
    isLoading,
    error,
    snackbarVisible,
    setSnackbarVisible,
    familyDetailUrl,
    injectedJavaScriptBeforeContentLoaded,
  } = useFamilyTreeData();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    webview: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      color: theme.colors.error,
      textAlign: 'center',
      fontSize: 16,
    },
    noFamilySelectedText: {
      textAlign: 'center',
      marginTop: 20,
    },
  });

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('familyDetail.tab.familyTreeShort')} />
        {currentFamilyId && (
          <Appbar.Action icon="share-variant" onPress={onShare} color={theme.colors.onSurface} />
        )}
      </Appbar.Header>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      ) : error && !snackbarVisible ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : currentFamilyId ? (
        <WebView
          source={{ uri: familyDetailUrl }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
        />
      ) : (
        <Text variant="headlineMedium" style={styles.noFamilySelectedText}>{t('familyDetail.noFamilySelected')}</Text>
      )}
      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={Snackbar.DURATION_SHORT}
          action={{
            label: t('common.dismiss'),
            onPress: () => {
              setSnackbarVisible(false);
            },
          }}>
          {error}
        </Snackbar>
      </Portal>
    </View>
  );
}