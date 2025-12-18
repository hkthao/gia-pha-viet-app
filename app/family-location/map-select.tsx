import React, { useRef, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import { useMapSelectionStore } from '@/stores/useMapSelectionStore'; // Import useMapSelectionStore

const MapSelectScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { initialLatitude, initialLongitude } = useLocalSearchParams();
  const { setCoordinates } = useMapSelectionStore(); // Use the store's setCoordinates action

  const webViewRef = useRef<WebView>(null);
  const WEB_MAP_SELECT_URL = `${process.env.EXPO_PUBLIC_APP_BASE_URL}/public/mobile/map-picker`;

  const injectedJavaScriptBeforeContentLoaded = useMemo(() => {
    const lat = initialLatitude ? parseFloat(initialLatitude as string) : null;
    const lon = initialLongitude ? parseFloat(initialLongitude as string) : null;
    return `
      window.initialCoordinates = { latitude: ${lat}, longitude: ${lon} };
      window.mapboxAccessToken = '${process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || ''}';
      true;
    `;
  }, [initialLatitude, initialLongitude]);

  const onWebViewMessage = useCallback((event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.coordinates && typeof message.coordinates.latitude === 'number' && typeof message.coordinates.longitude === 'number') {
        setCoordinates(message.coordinates.latitude, message.coordinates.longitude); // Set coordinates in the store
        router.back();
      }
    } catch (e) {
      console.error('Error parsing WebView message:', e);
    }
  }, [router, setCoordinates]);

  const styles = useMemo(() => StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
      width: '100%',
    },
    map: {
      flex: 1,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING_MEDIUM,
    },
  }), [theme]);

  return (
    <View style={styles.page}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('familyLocation.mapSelect.title')} />
      </Appbar.Header>
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ uri: WEB_MAP_SELECT_URL }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          allowingReadAccessToURL="file:///"
          onMessage={onWebViewMessage}
          injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
          onLoadEnd={() => {
            console.log('WebView finished loading map-select and data injected');
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView map-select error: ', nativeEvent);
          }}
        />
      </View>
    </View>
  );
};

export default MapSelectScreen;
