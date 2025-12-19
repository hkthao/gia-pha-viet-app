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

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import React Query
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import GestureHandlerRootView
import { useGetMyAccessFamiliesQuery } from '@/hooks/family/useFamilyQueries'; // Import useGetMyAccessFamiliesQuery
import { useGetCurrentUserProfileQuery, userProfileQueryKeys } from '@/hooks/user/useUserProfileQueries'; // Import useGetCurrentUserProfileQuery and userProfileQueryKeys

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

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const onboarded = await AsyncStorage.getItem('hasOnboarded');
        setHasOnboarded(onboarded === 'true');
      } catch (_e) {
        console.error(_e);
        setHasOnboarded(false); // Assume not onboarded on error
      }
    };

    checkOnboardingStatus();
  }, []);

  if (hasOnboarded === null || isLoadingAuth) { // Show loading until onboarding and auth are checked
    return null
  }

  return !!hasOnboarded ? (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent hasOnboarded={hasOnboarded} isLoadingAuth={isLoadingAuth} />
      </ThemeProvider>
    </QueryClientProvider>
  ) : (
    <OnboardingScreen />
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
  const { refetch: refetchUserProfile } = useGetCurrentUserProfileQuery({ queryKey: userProfileQueryKeys.current(), enabled: false });

  useEffect(() => {
    if (hasOnboarded !== null && !isLoadingAuth) { // Only hide splash screen if auth is loaded
      SplashScreen.hideAsync();
      // Load user permissions after authentication is complete
      refetchMyAccess();
      // Fetch user profile after authentication and permissions are initiated
      refetchUserProfile();
    }
  }, [hasOnboarded, isLoadingAuth, refetchMyAccess, refetchUserProfile]); // Add refetchUserProfile to dependencies
  
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
              </Stack>
            </NavigationThemeProvider>
          </SnackbarProvider>
        </LoadingOverlayProvider>
      </Portal.Host>
    </PaperProvider>
    </GestureHandlerRootView>
  );
}
