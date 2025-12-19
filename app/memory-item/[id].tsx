// gia-pha-viet-app/app/memory/[id].tsx

import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Appbar, Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import { useMemoryItem } from '@/hooks/memory/useMemoryItem';
import MemoryItemDetail from '@/components/memory/MemoryItemDetail';

export default function MemoryItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();

  const memoryItemId = Array.isArray(id) ? id[0] : id;

  const { data: memoryItem, isLoading, error } = useMemoryItem(memoryItemId as string);

  const handleEdit = useCallback(() => {
    router.push(`/memory-item/${memoryItemId}/edit`);
  }, [router, memoryItemId]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      padding: SPACING_MEDIUM,
      backgroundColor: theme.colors.errorContainer,
      marginBottom: SPACING_MEDIUM,
    },
    errorText: {
      color: theme.colors.onErrorContainer,
      textAlign: 'center',
    },
  }), [theme]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t('memory.detailTitle')} />
          {memoryItemId && <Appbar.Action icon="pencil" onPress={handleEdit} />}
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="bodyMedium" style={styles.errorText}>
            {t('common.error_occurred')}: {error.message}
          </Text>
        </View>
      </View>
    );
  }

  if (!memoryItem) {
    return (
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t('memory.detailTitle')} />
          {memoryItemId && <Appbar.Action icon="pencil" onPress={handleEdit} />}
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="bodyMedium" style={styles.errorText}>
            {t('memory.errors.dataNotAvailable')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={memoryItem.title || t('memory.detailTitle')} />
        <Appbar.Action icon="pencil" onPress={handleEdit} />
      </Appbar.Header>
      <MemoryItemDetail memoryItem={memoryItem} />
    </View>
  );
}
