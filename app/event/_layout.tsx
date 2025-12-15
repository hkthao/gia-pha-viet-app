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
          headerShown: true, // Show header for this screen
          header: ({ navigation, route }) => (
            <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
              <Appbar.BackAction onPress={() => navigation.goBack()} color={theme.colors.onSurface} />
              <Appbar.Content title={(route.params as { name?: string })?.name || t('eventDetail.title')} titleStyle={{ color: theme.colors.onSurface }} />
              {(route.params as { id?: string })?.id && ( // Check if id exists to show edit button
                <Appbar.Action icon="pencil" onPress={() => router.push(`/event/${(route.params as { id: string })?.id}/edit`)} color={theme.colors.onSurface} />
              )}
            </Appbar.Header>
          ),
        }}
      />
      <Stack.Screen name="[id]/edit" options={{ title: t('eventForm.editTitle') }} />
    </Stack>
  );
}