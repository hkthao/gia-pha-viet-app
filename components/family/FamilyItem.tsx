import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Chip, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import DefaultFamilyAvatar from '@/assets/images/familyAvatar.png';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { FamilyListDto } from '@/types';

interface FamilyItemProps {
  item: FamilyListDto;
  onSelect: (id: string | null) => void;
}

const getStyles = (theme: any) => StyleSheet.create({
  familyCard: {
    marginBottom: SPACING_SMALL,
    marginHorizontal: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: SPACING_MEDIUM,
  },
  cardText: {
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING_SMALL,
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: SPACING_SMALL / 2,
    marginBottom: SPACING_SMALL / 2,
    height: 28,
    justifyContent: 'center',
    borderWidth: 0,
  },
});

const FamilyItem = ({ item, onSelect }: FamilyItemProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const styles = getStyles(theme);

  return (
    <Card style={[styles.familyCard, { borderRadius: theme.roundness }]} onPress={() => {
      onSelect(item.id);
      router.push('/family/dashboard');
    }}>
      <Card.Content style={styles.cardContent}>
        <Avatar.Image size={48} source={item.avatarUrl ? { uri: item.avatarUrl } : DefaultFamilyAvatar} style={styles.avatar} />
        <View style={styles.cardText}>
          <Text variant="titleMedium">{item.name}</Text>
          <Text variant="bodyMedium">{item.address}</Text>
          <View style={styles.detailsRow}>
            <Chip icon="account-group" mode="outlined" style={styles.chip}>
              <Text variant="bodySmall">{item.totalMembers}</Text>
            </Chip>
            <Chip icon="family-tree" mode="outlined" style={styles.chip}>
              <Text variant="bodySmall">{item.totalGenerations}</Text>
            </Chip>
            <Chip icon={item.visibility.toLowerCase() === 'public' ? 'eye' : 'eye-off'} mode="outlined" style={styles.chip}>
              <Text variant="bodySmall">{t(`family.visibility.${item.visibility.toLowerCase()}`)}</Text>
            </Chip>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

export default memo(FamilyItem);