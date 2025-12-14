import { Stack, router, useSegments } from 'expo-router'; // Import useSegments
import { Appbar, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export default function MemberLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const segments = useSegments(); // Use useSegments to determine current screen


  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false, // Hide header for screens within this stack
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen name="create" />
        <Stack.Screen name="[id]" options={{ headerShown: false }} /> {/* This is the member detail route */}
        <Stack.Screen name="[id]/edit" />
      </Stack>
    </View>
  );
}
