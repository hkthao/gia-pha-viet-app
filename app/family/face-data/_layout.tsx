import { Stack, router, useSegments } from 'expo-router';
import { Appbar, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export default function FaceDataLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const segments = useSegments();

  const getScreenTitle = (segmentName: string) => {
    switch (segmentName) {
      case 'index':
        return t('more.faceData'); // Title for the face data list screen
      case 'create':
        return t('faceDataForm.createTitle');
      case '[id]':
        return t('faceDataDetail.title');
      default:
        return t('more.faceData');
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
          headerShown: false, // Hide header for screens within this stack, handled by Appbar.Header above
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="create" />
        <Stack.Screen name="[id]" />
      </Stack>
    </View>
  );
}