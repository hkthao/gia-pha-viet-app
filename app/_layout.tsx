import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import "react-native-reanimated";
import { PaperProvider, Portal } from "react-native-paper";
import { getPaperTheme } from "@/constants/theme";
import { ThemeProvider, useThemeContext } from "@/context/ThemeContext";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OnboardingScreen from "@/app/onboarding";
import LoginScreen from "@/app/login"; // Import LoginScreen
import { useAuth } from "@/hooks/auth/useAuth"; // Import useAuth
import { LoadingOverlayProvider } from "@/hooks/ui/useLoadingOverlay"; // Import LoadingOverlayProvider
import { SnackbarProvider } from "@/hooks/ui/useGlobalSnackbar"; // Import SnackbarProvider
import { StatusBar as ExpoStatusBar } from "expo-status-bar"; // Import StatusBar

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Import React Query
import { GestureHandlerRootView } from "react-native-gesture-handler"; // Import GestureHandlerRootView
import { useGetMyAccessFamiliesQuery } from "@/hooks/family/useFamilyQueries"; // Import useGetMyAccessFamiliesQuery
import {
  useGetCurrentUserProfileQuery,
  userProfileQueryKeys,
} from "@/hooks/user/useUserProfileQueries"; // Import useGetCurrentUserProfileQuery and userProfileQueryKeys


export const unstable_settings = {
  anchor: "(tabs)",
};

// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const { isLoadingAuth, isLoggedIn } = useAuth(); // Get isLoadingAuth and isLoggedIn from useAuth

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const onboarded = await AsyncStorage.getItem("hasOnboarded");
        setHasOnboarded(onboarded === "true");
      } catch (_e) {
        console.error(_e);
        setHasOnboarded(false); // Assume not onboarded on error
      }
    };

    checkOnboardingStatus();
  }, []);

  if (hasOnboarded === null || isLoadingAuth) {
    // Show loading until onboarding and auth are checked
    return null;
  }

  // If onboarding not done, show onboarding screen
  if (!hasOnboarded) {
    return <OnboardingScreen />;
  }

  // If onboarded, wrap everything else in QueryClientProvider and ThemeProvider
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {/* If onboarded but not logged in, show login screen */}
        {hasOnboarded && !isLoggedIn && (
          <LoginScreen />
        )}

        {/* If onboarded and logged in, show main app content */}
        {hasOnboarded && isLoggedIn && (
          <AppContent hasOnboarded={hasOnboarded} isLoadingAuth={isLoadingAuth} />
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

interface AppContentProps {
  hasOnboarded: boolean | null;
  isLoadingAuth: boolean;
}

function AppContent({ hasOnboarded, isLoadingAuth }: AppContentProps) {
  const { colorScheme } = useThemeContext();
  const paperTheme = getPaperTheme(colorScheme);

  // Move react-query hooks and related useEffect here
  const { refetch: refetchMyAccess } = useGetMyAccessFamiliesQuery(); // To manually trigger if needed
  const { refetch: refetchUserProfile } = useGetCurrentUserProfileQuery({
    queryKey: userProfileQueryKeys.current(),
    enabled: false,
  });

  useEffect(() => {
    const splashTimeout = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 5000); // Hide splash screen after 5 seconds as a fallback

    if (hasOnboarded !== null && !isLoadingAuth) {
      clearTimeout(splashTimeout); // Clear timeout if conditions are met before it fires
      // Only hide splash screen if auth is loaded
      SplashScreen.hideAsync();
      // Load user permissions after authentication is complete
      refetchMyAccess();
      // Fetch user profile after authentication and permissions are initiated
      refetchUserProfile();
    }

    return () => clearTimeout(splashTimeout); // Cleanup timeout on unmount
  }, [hasOnboarded, isLoadingAuth, refetchMyAccess, refetchUserProfile]); // Add refetchUserProfile to dependencies

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <Portal.Host>
          <LoadingOverlayProvider>
            <SnackbarProvider>
              <NavigationThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
              >
                <ExpoStatusBar
                  backgroundColor={paperTheme.colors.background}
                  style={colorScheme === "dark" ? "light" : "dark"}
                />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                </Stack>
              </NavigationThemeProvider>
            </SnackbarProvider>
          </LoadingOverlayProvider>
        </Portal.Host>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
