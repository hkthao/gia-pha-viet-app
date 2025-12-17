import { Stack } from 'expo-router'; // Removed router, useSegments
import { useTheme } from 'react-native-paper'; // Removed Appbar
// Removed useTranslation
import { View } from 'react-native';

export default function MemberLayout() {
  // const { t } = useTranslation(); // Removed initialization as it's not used
  const theme = useTheme();
  // const segments = useSegments(); // Removed initialization as it's not used


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
