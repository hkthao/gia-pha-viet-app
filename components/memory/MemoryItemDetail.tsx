// gia-pha-viet-app/components/memory/MemoryItemDetail.tsx

import React, { memo, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Card, Text, useTheme, List, Divider, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MemoryItemDto, EmotionalTag } from '@/types';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import dayjs from 'dayjs';

interface MemoryItemDetailProps {
  memoryItem: MemoryItemDto;
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: SPACING_MEDIUM,
  },
  card: {
    marginBottom: SPACING_MEDIUM,
    borderRadius: theme.roundness,
  },
  detailsContainer: {
    width: '100%',
  },
  titleText: {
    marginBottom: SPACING_SMALL,
    textAlign: 'center',
  },
  descriptionText: {
    marginBottom: SPACING_MEDIUM,
    textAlign: 'center',
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING_SMALL,
    marginTop: SPACING_SMALL,
  },
  mediaImage: {
    width: 100,
    height: 100,
    borderRadius: theme.roundness,
  },
  personChip: {
    marginRight: SPACING_SMALL / 2,
    marginBottom: SPACING_SMALL / 2,
  }
});

const MemoryItemDetail = ({ memoryItem }: MemoryItemDetailProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);

  const getEmotionalTagLabel = (tag: EmotionalTag) => {
    switch (tag) {
      case EmotionalTag.Happy: return t('emotionalTag.happy');
      case EmotionalTag.Sad: return t('emotionalTag.sad');
      case EmotionalTag.Angry: return t('emotionalTag.angry');
      case EmotionalTag.Surprise: return t('emotionalTag.surprise');
      case EmotionalTag.Love: return t('emotionalTag.love');
      case EmotionalTag.Neutral:
      default: return t('emotionalTag.neutral');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.titleText}>{memoryItem.title}</Text>
          {memoryItem.description && <Text variant="bodyMedium" style={styles.descriptionText}>{memoryItem.description}</Text>}

          <List.Section>
            <List.Item
              title={t('memory.happenedAt')}
              description={dayjs(memoryItem.happenedAt).format('DD/MM/YYYY')}
              left={() => <List.Icon icon="calendar" />}
            />
            <Divider />

            <List.Item
              title={t('memory.emotionalTag')}
              description={getEmotionalTagLabel(memoryItem.emotionalTag)}
              left={() => <List.Icon icon="emoticon-outline" />}
            />
            <Divider />

            <List.Item
              title={t('memory.familyId')}
              description={memoryItem.familyId}
              left={() => <List.Icon icon="family-tree" />}
            />
            <Divider />
          </List.Section>

          {memoryItem.memoryMedia && memoryItem.memoryMedia.length > 0 && (
            <List.Section>
              <List.Subheader>{t('memory.media')}</List.Subheader>
              <View style={styles.mediaContainer}>
                {memoryItem.memoryMedia.map((media, index) => (
                  <Image key={media.id || index} source={{ uri: media.url }} style={styles.mediaImage} />
                ))}
              </View>
            </List.Section>
          )}

          {memoryItem.memoryPersons && memoryItem.memoryPersons.length > 0 && (
            <List.Section>
              <List.Subheader>{t('memory.involvedPersons')}</List.Subheader>
              <View style={styles.mediaContainer}>
                {memoryItem.memoryPersons.map((person, index) => (
                  <Chip key={person.memberId || index} icon="account" style={styles.personChip}>
                    {person.memberName}
                  </Chip>
                ))}
              </View>
            </List.Section>
          )}

        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default memo(MemoryItemDetail);
