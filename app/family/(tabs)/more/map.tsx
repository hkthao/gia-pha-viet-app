import React, { useRef, useMemo, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Appbar, useTheme, ActivityIndicator, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { WebView } from "react-native-webview"; // Import WebView
import { useFamilyLocations } from "@/hooks/familyLocation/useFamilyLocationQueries"; // Corrected hook name
import { SPACING_MEDIUM } from "@/constants/dimensions"; // Import SPACING_MEDIUM
import { useCurrentFamilyStore } from "@/stores/useCurrentFamilyStore"; // Import useCurrentFamilyStore
import { usePermissionCheck } from "@/hooks/permissions/usePermissionCheck"; // Import usePermissionCheck

const MapViewScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { currentFamilyId } = useCurrentFamilyStore();
  const { canManageFamily, isAdmin } = usePermissionCheck(
    currentFamilyId ?? undefined
  );

  const webViewRef = useRef<WebView>(null);
  const WEB_MAP_URL = `${process.env.EXPO_PUBLIC_APP_BASE_URL}/public/mobile/map`;

  // Fetch all family locations
  const {
    data: familyLocationsPaginatedList,
    isLoading,
    isError,
    error,
  } = useFamilyLocations({
    searchQuery: "",
    locationType: undefined,
    accuracy: undefined,
    source: undefined,
    familyId: currentFamilyId || "",
    page: 1, // Fetch all on first page for map
  });

  const familyLocations = useMemo(
    () => familyLocationsPaginatedList?.items || [],
    [familyLocationsPaginatedList]
  );

  const injectedJavaScriptBeforeContentLoaded = useMemo(() => {
    const data = JSON.stringify(familyLocations);
    return `
      window.familyLocationsData = ${data};
      window.mapboxAccessToken = '${
        process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || ""
      }';
      true; // Note: the last expression in the string is returned
    `;
  }, [familyLocations]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const onWebViewMessage = useCallback((event: any) => {
    const message = JSON.parse(event.nativeEvent.data);
    if (message.type === "MARKER_CLICK") {
      Alert.alert(message.payload.name, message.payload.description);
    }
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        page: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        container: {
          flex: 1,
          width: "100%",
          backgroundColor: "red",
        },
        map: {
          flex: 1,
        },
        loadingOverlay: {
          ...StyleSheet.absoluteFillObject,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 1,
        },
        errorContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: SPACING_MEDIUM,
        },
      }),
    [theme]
  );

  if (isLoading) {
    return (
      <View style={[styles.page]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleBack} />
          <Appbar.Content title={t("familyLocation.mapViewTitle")} />
          {(canManageFamily || isAdmin) && (
            <Appbar.Action
              icon="plus"
              onPress={() => router.push("/family-location/create")}
            />
          )}
        </Appbar.Header>
        <View style={styles.loadingOverlay}>
          <ActivityIndicator
            animating
            size="large"
            color={theme.colors.primary}
          />
          <Text variant="titleMedium" style={{ color: theme.colors.onPrimary }}>
            {t("common.loading")}
          </Text>
        </View>
      </View>
    );
  }

  if (isError || !familyLocations) {
    return (
      <View style={[styles.page]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleBack} />
          <Appbar.Content title={t("familyLocation.mapViewTitle")} />
          {(canManageFamily || isAdmin) && (
            <Appbar.Action
              icon="plus"
              onPress={() => router.push("/family-location/create")}
            />
          )}
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="titleMedium" style={{ color: theme.colors.error }}>
            {error?.message || t("common.error_occurred")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.page]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title={t("familyLocation.mapViewTitle")} />
        {(canManageFamily || isAdmin) && (
          <Appbar.Action
            icon="plus"
            onPress={() => router.push("/family-location/create")}
          />
        )}
      </Appbar.Header>
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ uri: WEB_MAP_URL }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          allowingReadAccessToURL="file:///"
          onMessage={onWebViewMessage}
          injectedJavaScriptBeforeContentLoaded={
            injectedJavaScriptBeforeContentLoaded
          }
          onLoadEnd={() => {
            console.log("WebView finished loading and data injected");
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn("WebView error: ", nativeEvent);
          }}
        />
      </View>
    </View>
  );
};

export default MapViewScreen;
