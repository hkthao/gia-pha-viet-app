import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { PaperProvider, Portal } from 'react-native-paper';
import { getPaperTheme } from '@/constants/theme';
import { ThemeProvider, useThemeContext } from '@/context/ThemeContext';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from '@/app/onboarding';
import { useAuth } from '@/hooks/auth/useAuth'; // Import useAuth
import { LoadingOverlayProvider } from '@/hooks/ui/useLoadingOverlay'; // Import LoadingOverlayProvider
import { SnackbarProvider } from '@/hooks/ui/useGlobalSnackbar'; // Import SnackbarProvider
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'; // Import StatusBar
import { usePermissionStore } from '@/stores/usePermissionStore'; // Import usePermissionStore
import { useUserProfileStore } from '@/stores/useUserProfileStore'; // Import useUserProfileStore
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import React Query
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import GestureHandlerRootView

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const { isLoadingAuth } = useAuth(); // Get isLoadingAuth from useAuth
  const { loadMyAccess } = usePermissionStore(); // Destructure loadMyAccess
  const { fetchUserProfile } = useUserProfileStore(); // Destructure fetchUserProfile

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const onboarded = await AsyncStorage.getItem('hasOnboarded');
        setHasOnboarded(onboarded === 'true');
      } catch (_e) {
        console.error(_e);
        setHasOnboarded(false); // Assume not onboarded on error
      } finally {
        // No longer hiding splash screen here, moved to a separate useEffect
      }
    };

    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (hasOnboarded !== null && !isLoadingAuth) { // Only hide splash screen if auth is loaded
      SplashScreen.hideAsync();
      // Load user permissions after authentication is complete
      loadMyAccess();
      // Fetch user profile after authentication and permissions are initiated
      fetchUserProfile();
    }
  }, [hasOnboarded, isLoadingAuth, loadMyAccess, fetchUserProfile]); // Add fetchUserProfile to dependencies

  if (hasOnboarded === null || isLoadingAuth) { // Show loading until onboarding and auth are checked
    return null
  }

  return hasOnboarded ? (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  ) : (
    <OnboardingScreen />
  );
}



function AppContent() {
  const { colorScheme } = useThemeContext();
  const paperTheme = getPaperTheme(colorScheme);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
      <Portal.Host>
        <LoadingOverlayProvider> {/* Wrap with LoadingOverlayProvider */}
          <SnackbarProvider> {/* Wrap with SnackbarProvider */}
            <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <ExpoStatusBar backgroundColor={paperTheme.colors.background} style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="family" options={{ headerShown: false }} />
                <Stack.Screen name="member/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="legal-webview" options={{ headerShown: false }} />
                <Stack.Screen name="feedback-webview" options={{ headerShown: false }} />
                <Stack.Screen name="faq-webview" options={{ headerShown: false }} />
                <Stack.Screen name="feature-under-development" options={{ headerShown: false }} />
                <Stack.Screen name="permission-denied" options={{ headerShown: false }} />
              </Stack>
            </NavigationThemeProvider>
          </SnackbarProvider>
        </LoadingOverlayProvider>
      </Portal.Host>
    </PaperProvider>
    </GestureHandlerRootView>
  );
}
