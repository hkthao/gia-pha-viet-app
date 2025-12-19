// gia-pha-viet-app/app/memory/_layout.tsx

import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

export default function MemoryItemStackLayout() {
  const { t } = useTranslation();
  const theme = useTheme();

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
      <Stack.Screen name="index" options={{ title: t('memory.listTitle') }} />
      <Stack.Screen name="create" options={{ title: t('memoryForm.createTitle') }} />
      <Stack.Screen name="[id]" options={{ title: t('memory.detailTitle') }} />
      <Stack.Screen name="[id]/edit" options={{ title: t('memoryForm.editTitle') }} />
    </Stack>
  );
}
