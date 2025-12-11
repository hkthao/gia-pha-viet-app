import { Stack, router, useSegments } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Appbar, useTheme } from 'react-native-paper';
import { View } from 'react-native';

export default function MoreLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const segments = useSegments(); // Get segments

  // Function to get the title of the current screen
  const getScreenTitle = (segmentName: string) => {
    switch (segmentName) {
      case 'index':
        return t('more.title');
      case 'calendar':
        return t('more.calendar');
      case 'face-data':
        return t('more.faceData');
      case 'memories':
        return t('more.memories');
      case 'timeline':
        return t('more.timeline');
      case 'privacy':
        return t('more.privacy');
      case 'detect-relationship':
        return t('detectRelationship.title');
      default:
        return t('more.title'); // Fallback title
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={getScreenTitle(segments[segments.length - 1])} />
      </Appbar.Header>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: t('more.title') }} />
        <Stack.Screen name="calendar" options={{ title: t('more.calendar') }} />
        <Stack.Screen name="face-data" options={{ title: t('more.faceData') }} />
        <Stack.Screen name="memories" options={{ title: t('more.memories') }} />
        <Stack.Screen name="timeline" options={{ title: t('more.timeline') }} />
        <Stack.Screen name="privacy" options={{ title: t('more.privacy') }} />
        <Stack.Screen name="detect-relationship" options={{ title: t('detectRelationship.title') }} />
      </Stack>
    </View>
  );
}