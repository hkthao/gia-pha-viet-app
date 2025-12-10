import { Stack, router } from 'expo-router';
import { Appbar, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export default function MemberLayout() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('memberDetail.title')} />
      </Appbar.Header>
      <Stack
        screenOptions={{
          headerShown: false, // Hide header for screens within this stack
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
      </Stack>
    </View>
  );
}
