// gia-pha-viet-app/app/memory/[id].tsx

import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Appbar, Text, useTheme, ActivityIndicator, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SPACING_LARGE, SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { useMemoryItem } from '@/hooks/memory/useMemoryItem';
import { useDeleteMemoryItem } from '@/hooks/memory/useDeleteMemoryItem';
import { usePermissionCheck } from '@/hooks/permissions/usePermissionCheck';
import MemoryItemDetail from '@/components/memory/MemoryItemDetail';

export default function MemoryItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();

  const memoryItemId = Array.isArray(id) ? id[0] : id;

  const { data: memoryItem, isLoading, error } = useMemoryItem(memoryItemId as string);
  const { mutate: deleteMemoryItem, isPending: isDeleting } = useDeleteMemoryItem();
  const { canManageFamily, isAdmin } = usePermissionCheck(memoryItem?.familyId);

  const handleEdit = useCallback(() => {
    router.push(`/memory-item/${memoryItemId}/edit`);
  }, [router, memoryItemId]);

  const handleDelete = useCallback(() => {
    if (!memoryItemId) return;

    Alert.alert(
      t('common.deleteConfirmationTitle'),
      t('memory.deleteConfirmationMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            deleteMemoryItem(memoryItemId, {
              onSuccess: () => {
                router.back();
              },
              onError: (err) => {
                Alert.alert(t('common.error'), err || t('common.error_occurred'));
              },
            });
          },
        },
      ],
      { cancelable: true }
    );
  }, [memoryItemId, deleteMemoryItem, router, t]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollViewContent: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
    deleteButtonContainer: {
      padding: SPACING_MEDIUM,
    },
    deleteButton: {
      marginTop: SPACING_SMALL,
      marginBottom: SPACING_LARGE,
      borderRadius: theme.roundness,
    },
    deleteButtonLabel: {
    },
  }), [theme]);

  const renderAppbarActions = () => (
    <>
      {(canManageFamily || isAdmin) && memoryItemId && <Appbar.Action icon="pencil" onPress={handleEdit} disabled={isDeleting} />}
    </>
  );

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
          {renderAppbarActions()}
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
          {renderAppbarActions()}
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
        {renderAppbarActions()}
      </Appbar.Header>
      <ScrollView style={styles.scrollViewContent}>
        <MemoryItemDetail memoryItem={memoryItem} />
        {(canManageFamily || isAdmin) && memoryItemId && (
          <View style={styles.deleteButtonContainer}>
            <Button
              mode="contained" // Changed from outlined to contained
              onPress={handleDelete}
              disabled={isDeleting}
              icon="delete"
              style={styles.deleteButton} // Use the defined style
              labelStyle={styles.deleteButtonLabel} // Use the defined style
            >
              {t('common.delete')}
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
