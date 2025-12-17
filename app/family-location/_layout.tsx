import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme, Appbar } from 'react-native-paper';

export default function FamilyLocationStackLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

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
      <Stack.Screen name="index" options={{ title: t('familyLocation.listTitle') }} />
      <Stack.Screen name="create" options={{ title: t('familyLocationForm.createTitle') }} />
      <Stack.Screen name="[id]" options={{ title: t('familyLocation.detailTitle') }} />
      <Stack.Screen name="[id]/edit" options={{ title: t('familyLocationForm.editTitle') }} />
    </Stack>
  );
}
