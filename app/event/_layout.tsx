import { Stack, useRouter } from 'expo-router'; // Import useRouter
import { useTranslation } from 'react-i18next';
import { useTheme, Appbar } from 'react-native-paper'; // Import Appbar

export default function EventStackLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter(); // Initialize useRouter

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false, // Hide header by default, child screens can override
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen name="create" options={{ title: t('eventForm.createTitle') }} />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false, // Hide header for this screen
        }}
      />
      <Stack.Screen name="[id]/edit" options={{ title: t('eventForm.editTitle') }} />
    </Stack>
  );
}