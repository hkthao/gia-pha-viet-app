import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, IconButton, useTheme, Text, MD3Theme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { FamilyLocationDto } from '@/types';

interface FamilyLocationItemProps {
  item: FamilyLocationDto;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPress: (id: string) => void;
}

const FamilyLocationItem: React.FC<FamilyLocationItemProps> = ({ item, onEdit, onDelete, onPress }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    listItem: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 0, // PaginatedSearchListV2 will handle outer padding
      marginBottom: 0, // PaginatedSearchListV2 will handle spacing
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

  return (
    <List.Item
      title={item.name}
      description={item.address || item.description || t('common.noDescription')}
      left={(props) => <List.Icon {...props} icon="map-marker" />}
      right={() => (
        <View style={styles.itemActions}>
          <IconButton icon="pencil" onPress={() => onEdit(item.id)} />
          <IconButton icon="delete" onPress={() => onDelete(item.id)} />
        </View>
      )}
      onPress={() => onPress(item.id)}
      style={styles.listItem}
      titleStyle={styles.listItemTitle}
      descriptionStyle={styles.listItemDescription}
    />
  );
};

export default FamilyLocationItem;
