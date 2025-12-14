import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export default function MoreLayout() {
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" options={{ title: t('more.title') }} />
        <Stack.Screen name="calendar" options={{ title: t('more.calendar') }} />
        <Stack.Screen name="memories" options={{ title: t('more.memories') }} />
        <Stack.Screen name="timeline" options={{ title: t('more.timeline') }} />
        <Stack.Screen name="privacy" options={{ title: t('more.privacy') }} />
        <Stack.Screen name="detect-relationship" options={{ title: t('detectRelationship.title') }} />
      </Stack>
    </View>
  );
}