import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, Appbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SPACING_MEDIUM } from '@/constants/dimensions';

export default function MoreMemoriesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: SPACING_MEDIUM,
    },
    text: {
      color: theme.colors.onBackground,
      textAlign: 'center',
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('more.memories')} />
      </Appbar.Header>
      <View style={styles.container}>
        {/* @ts-ignore */}
        <Text style={styles.text} variant="titleLarge">{t('more.memoriesPlaceholder')}</Text>
      </View>
    </View>
  );
}