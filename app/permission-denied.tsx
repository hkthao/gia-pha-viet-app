import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Button, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth'; // Assuming useAuth for logout/login status
import { SPACING_MEDIUM } from '@/constants/dimensions';

const PermissionDeniedScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/'); // Go to home if can't go back
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login'); // Go to login screen after logout
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING_MEDIUM,
    },
    appbar: {
      backgroundColor: theme.colors.background,
      elevation: 0, // No shadow for a flat look
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.error, // Use error color for emphasis
      marginBottom: SPACING_MEDIUM,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      color: theme.colors.onBackground,
      marginBottom: SPACING_MEDIUM * 2,
      textAlign: 'center',
    },
    buttonContainer: {
      width: '80%',
      gap: SPACING_MEDIUM,
    },
  }), [theme]);

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={handleGoBack} />
        <Appbar.Content title={t('permissionDenied.title')} />
      </Appbar.Header>

      <View style={styles.container}> {/* Centered content */}
        <Text style={styles.title}>{t('permissionDenied.accessDenied')}</Text>
        <Text style={styles.message}>{t('permissionDenied.message')}</Text>
        
        <View style={styles.buttonContainer}>
          <Button mode="contained" onPress={handleGoBack}>
            {t('permissionDenied.goBack')}
          </Button>
          {isLoggedIn && (
            <Button mode="outlined" onPress={handleLogout}>
              {t('permissionDenied.logout')}
            </Button>
          )}
          {/* Add a contact support button if applicable */}
          {/* <Button mode="outlined" onPress={() => router.push('/contact-support')}>
            {t('permissionDenied.contactSupport')}
          </Button> */}
        </View>
      </View>
    </View>
  );
};

export default PermissionDeniedScreen;