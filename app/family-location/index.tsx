import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Appbar, useTheme, ActivityIndicator, Text, List, FAB, Searchbar, IconButton, Button, MD3Theme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useFamilyLocations, useDeleteFamilyLocation } from '@/hooks/familyLocation/useFamilyLocationQueries';
import { FamilyLocationDto, SearchFamilyLocationsQuery } from '@/types';
import { SPACING_MEDIUM, SPACING_LARGE } from '@/constants/dimensions';
import { ConfirmationDialog } from '@/components/common';
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore';

interface FamilyLocationItemProps {
  item: FamilyLocationDto;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPress: (id: string) => void;
  theme: MD3Theme;
  t: (key: string, options?: any) => string;
}

const FamilyLocationItem: React.FC<FamilyLocationItemProps> = ({ item, onEdit, onDelete, onPress, theme, t }) => (
  <List.Item
    title={item.name}
    description={item.address || item.description || t('common.noDescription')}
    left={(props) => <List.Icon {...props} icon="map-marker" />}
    right={() => (
      <View style={styles(theme).itemActions}>
        <IconButton icon="pencil" onPress={() => onEdit(item.id)} />
        <IconButton icon="delete" onPress={() => onDelete(item.id)} />
      </View>
    )}
    onPress={() => onPress(item.id)}
    style={styles(theme).listItem}
    titleStyle={styles(theme).listItemTitle}
    descriptionStyle={styles(theme).listItemDescription}
  />
);

const styles = (theme: MD3Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: SPACING_LARGE * 4, // Adjust for FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: SPACING_MEDIUM,
    backgroundColor: theme.colors.errorContainer,
    margin: SPACING_MEDIUM,
    borderRadius: theme.roundness,
  },
  errorText: {
    color: theme.colors.onErrorContainer,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING_LARGE,
    right: 0,
    bottom: SPACING_LARGE,
    backgroundColor: theme.colors.primaryContainer,
  },
  searchBar: {
    margin: SPACING_MEDIUM,
    backgroundColor: theme.colors.surface,
    elevation: 1, // for Android shadow
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING_MEDIUM,
  },
  emptyListText: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
  },
  listItem: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: SPACING_MEDIUM,
    marginTop: SPACING_MEDIUM,
    borderRadius: theme.roundness,
  },
  listItemTitle: {
    fontWeight: 'bold',
  },
  listItemDescription: {
    color: theme.colors.onSurfaceVariant,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default function FamilyLocationListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { currentFamilyId } = useCurrentFamilyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const filters: SearchFamilyLocationsQuery = useMemo(() => ({
    familyId: currentFamilyId || undefined,
    name: searchQuery || undefined,
  }), [currentFamilyId, searchQuery]);

  const { data, isLoading, isError, error, refetch } = useFamilyLocations(filters);
  const { mutate: deleteFamilyLocation, isPending: isDeleting } = useDeleteFamilyLocation();

  const handleCreate = useCallback(() => {
    router.push('/family-location/create');
  }, [router]);

  const handleEdit = useCallback((id: string) => {
    router.push(`/family-location/${id}/edit`);
  }, [router]);

  const handleDetailPress = useCallback((id: string) => {
    router.push(`/family-location/${id}`);
  }, [router]);

  const handleDeleteConfirm = useCallback(() => {
    if (selectedLocationId) {
      deleteFamilyLocation(selectedLocationId, {
        onSuccess: () => {
          setDialogVisible(false);
          setSelectedLocationId(null);
          // Invalidate and refetch is handled by useDeleteFamilyLocation hook
        },
        onError: (err) => {
          setDialogVisible(false);
          setSelectedLocationId(null);
          Alert.alert(t('common.error'), err.message || t('common.error_occurred'));
        },
      });
    }
  }, [selectedLocationId, deleteFamilyLocation, t]);

  const handleDeletePress = useCallback((id: string) => {
    setSelectedLocationId(id);
    setDialogVisible(true);
  }, []);

  const renderItem = useCallback(({ item }: { item: FamilyLocationDto }) => (
    <FamilyLocationItem
      item={item}
      onEdit={handleEdit}
      onDelete={handleDeletePress}
      onPress={handleDetailPress}
      theme={theme}
      t={t}
    />
  ), [handleEdit, handleDeletePress, handleDetailPress, theme, t]);

  if (!currentFamilyId) {
    return (
      <View style={styles(theme).container}>
        <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t('familyLocation.listTitle')} />
        </Appbar.Header>
        <View style={styles(theme).emptyListContainer}>
          <Text style={styles(theme).emptyListText}>
            {t('familyLocation.selectFamilyPrompt')}
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles(theme).loadingContainer}>
        <ActivityIndicator animating size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles(theme).container}>
        <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t('familyLocation.listTitle')} />
        </Appbar.Header>
        <View style={styles(theme).errorContainer}>
          <Text variant="bodyMedium" style={styles(theme).errorText}>
            {t('common.error_occurred')}: {error?.message}
          </Text>
          <Button mode="outlined" onPress={() => refetch()} style={{ marginTop: SPACING_MEDIUM }}>
            {t('common.retry')}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles(theme).container}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('familyLocation.listTitle')} />
      </Appbar.Header>
      <Searchbar
        placeholder={t('familyLocation.searchPlaceholder')}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles(theme).searchBar}
        elevation={0}
      />
      {data?.items && data.items.length > 0 ? (
        <FlatList
          data={data.items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles(theme).content}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles(theme).emptyListContainer}>
          <Text variant="titleMedium" style={styles(theme).emptyListText}>
            {t('familyLocation.noLocationsFound')}
          </Text>
          <Text variant="bodyMedium" style={styles(theme).emptyListText}>
            {t('familyLocation.createOneNow')}
          </Text>
        </View>
      )}
      <FAB
        icon="plus"
        label={t('familyLocation.addLocation')}
        style={styles(theme).fab}
        onPress={handleCreate}
        color={theme.colors.onPrimaryContainer}
      />
      <ConfirmationDialog
        visible={dialogVisible}
        onDismiss={() => setDialogVisible(false)}
        onConfirm={handleDeleteConfirm}
        title={t('familyLocation.deleteConfirmTitle')}
        message={t('familyLocation.deleteConfirmMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        loading={isDeleting}
      />
    </View>
  );
}
