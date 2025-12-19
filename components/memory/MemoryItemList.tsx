// gia-pha-viet-app/components/memory/MemoryItemList.tsx

import React, { memo } from 'react';
import { FlatList, View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MemoryItemDto } from '@/types';
import MemoryItemListItem from './MemoryItemListItem';
import { SPACING_MEDIUM } from '@/constants/dimensions';

interface MemoryItemListProps {
  memoryItems: MemoryItemDto[];
  isLoading: boolean;
  isError: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  onItemPress: (id: string) => void;
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING_MEDIUM,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
  },
  footerLoader: {
    marginVertical: SPACING_MEDIUM,
  },
});

const MemoryItemList = ({
  memoryItems,
  isLoading,
  isError,
  onRefresh,
  onEndReached,
  onItemPress,
}: MemoryItemListProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);

  if (isLoading && memoryItems.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.errorText}>{t('common.errorLoadingData')}</Text>
      </View>
    );
  }

  if (memoryItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="titleMedium">{t('memory.noMemoryItemsFound')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={memoryItems}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MemoryItemListItem item={item} onPress={onItemPress} />}
      onRefresh={onRefresh}
      refreshing={isLoading}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      contentContainerStyle={{ paddingHorizontal: SPACING_MEDIUM }}
      ListFooterComponent={isLoading ? <ActivityIndicator style={styles.footerLoader} /> : null}
    />
  );
};

export default memo(MemoryItemList);
