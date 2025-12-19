// gia-pha-viet-app/app/memory-item/index.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Text } from 'react-native-paper'; // Import Text from react-native-paper
import { useTranslation } from 'react-i18next';

export default function MemoryItemsListScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    text: {
      color: theme.colors.onBackground,
      fontSize: 20,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('memory.listTitle')}</Text>
    </View>
  );
}