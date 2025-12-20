// gia-pha-viet-app/components/memory/MemoryItemListItem.tsx

import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Chip, MD3Theme, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MemoryItemDto, EmotionalTag } from '@/types';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import dayjs from 'dayjs';
import { getMemberAvatarSource } from '@/utils/imageUtils';

interface MemoryItemListItemProps {
  item: MemoryItemDto;
  onPress: (id: string) => void;
}

const getStyles = (theme: MD3Theme) => StyleSheet.create({
  memoryCard: {
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

const MemoryItemListItem = ({ item, onPress }: MemoryItemListItemProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);

  const getEmotionalTagLabel = (tag: EmotionalTag) => {
    switch (tag) {
      case EmotionalTag.Happy: return t('emotionalTag.happy');
      case EmotionalTag.Sad: return t('emotionalTag.sad');
      case EmotionalTag.Proud: return t('emotionalTag.proud');
      case EmotionalTag.Memorial: return t('emotionalTag.memorial');
      case EmotionalTag.Neutral:
      default: return t('emotionalTag.neutral');
    }
  };

  const getEmotionalTagIcon = (tag: EmotionalTag) => {
    switch (tag) {
      case EmotionalTag.Happy: return 'emoticon-happy-outline';
      case EmotionalTag.Sad: return 'emoticon-sad-outline';
      case EmotionalTag.Proud: return 'medal'; // Placeholder icon
      case EmotionalTag.Memorial: return 'grave-stone'; // Placeholder icon
      case EmotionalTag.Neutral:
      default: return 'emoticon-neutral-outline';
    }
  };


  return (
    <Card style={[styles.memoryCard, { borderRadius: theme.roundness }]} onPress={() => onPress(item.id)}>
      <Card.Content style={styles.cardContent}>
        <Avatar.Image
          size={48}
          source={getMemberAvatarSource(item.memoryMedia?.[0]?.url)}
          style={styles.avatar}
        />
        <View style={styles.cardText}>
          <Text variant="titleMedium">{item.title}</Text>
          <Text variant="bodyMedium">{dayjs(item.happenedAt).format('DD/MM/YYYY')}</Text>
          <View style={styles.detailsRow}>
            <Chip icon={getEmotionalTagIcon(item.emotionalTag)} mode="outlined" style={styles.chip}>
              <Text variant="bodySmall">{getEmotionalTagLabel(item.emotionalTag)}</Text>
            </Chip>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

export default memo(MemoryItemListItem);
