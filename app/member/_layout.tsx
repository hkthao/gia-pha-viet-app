import { Stack, router, useSegments } from 'expo-router'; // Import useSegments
import { Appbar, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export default function MemberLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const segments = useSegments(); // Use useSegments to determine current screen

  const getScreenTitle = (segmentName: string) => {
    switch (segmentName) {
      case 'create':
        return t('memberForm.createTitle');
      case '[id]':
        // This is the member detail screen, title is handled in the screen itself
        return '';
      case 'edit':
        return t('memberForm.editTitle');
      default:
        return t('memberDetail.title');
    }
  };

  const currentSegment = segments[segments.length - 1];
  const headerTitle = getScreenTitle(currentSegment);


  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        {headerTitle ? <Appbar.Content title={headerTitle} /> : null}
      </Appbar.Header>
      <Stack
        screenOptions={{
          headerShown: false, // Hide header for screens within this stack
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen name="create" />
        <Stack.Screen name="[id]" /> {/* This is the member detail route */}
        <Stack.Screen name="[id]/edit" />
      </Stack>
    </View>
  );
}
