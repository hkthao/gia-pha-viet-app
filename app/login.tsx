import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Appbar, Text, Button, useTheme } from 'react-native-paper';
import { useAuth } from '@/hooks/auth/useAuth';
import { useGetCurrentUserProfileQuery, userProfileQueryKeys } from '@/hooks/user/useUserProfileQueries'; // Import useGetCurrentUserProfileQuery and userProfileQueryKeys
import { SPACING_LARGE, SPACING_MEDIUM } from '@/constants/dimensions';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = useAuth();
  const { refetch: refetchUserProfile } = useGetCurrentUserProfileQuery({ queryKey: userProfileQueryKeys.current(), enabled: false });
  const theme = useTheme();
  const handleLogin = async () => {
    const success = await login();
    if (success) {
      await refetchUserProfile(); // Fetch user profile after successful login
      router.replace('/(tabs)');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    backgroundImage: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: 0,
      opacity: 0.7
    },
    contentContainer: {
      padding: SPACING_MEDIUM,
      zIndex: 2,
      alignItems: 'center',
      top: "30%",
      flex: 1,
    },
    title: {
      padding: SPACING_MEDIUM,
      textAlign: 'center',
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    description: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },
    loginButton: {
      marginTop: SPACING_LARGE,
      width: '80%',
      borderRadius: theme.roundness
    },
    appBar: {
      backgroundColor: 'transparent'
    }
  });

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/login_image.png')}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      <Appbar.Header style={styles.appBar}>
        {router.canGoBack() && <Appbar.BackAction onPress={() => router.back()} />}
      </Appbar.Header>
      <View style={styles.contentContainer}
      >
        <Text variant="headlineLarge" style={styles.title}>{t('login.title')}</Text>
        <Text variant="bodyLarge" style={styles.description}>{t('login.description')}</Text>
        <Button mode="contained" onPress={handleLogin} style={styles.loginButton}>
          {t('login.button')}
        </Button>
      </View>
    </View>
  );
}
