import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { DetectedFaceDto } from '@/types';
import { getAvatarSource } from '@/utils/imageUtils'; // Import getAvatarSource

interface FaceItemProps {
  item: DetectedFaceDto;
}

const getStyles = (theme: any) => StyleSheet.create({
  faceCard: {
    marginBottom: SPACING_MEDIUM,
    marginHorizontal: 1,
  },
  cardContent: {
    flexDirection: 'row',
  },
  thumbnail: {
    marginRight: SPACING_MEDIUM,
    borderRadius: theme.roundness,
    backgroundColor: "transparent"
  },
  cardText: {
    flex: 1,
  },
  // New style for horizontal layout of details
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

const FaceItem = ({ item }: FaceItemProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const styles = getStyles(theme);

  // Use getAvatarSource from imageUtils
  const faceImageSource = getAvatarSource(item.thumbnailUrl);

  // Navigate to member details if memberId is available
  const handlePress = () => {
    if (item.memberId) {
      router.push(`/member/${item.memberId}`);
    }
    // Optionally navigate to a face-specific detail screen if it exists
  };

  return (
    <Card style={[styles.faceCard, { borderRadius: theme.roundness }]} onPress={handlePress}>
      <Card.Content style={styles.cardContent}>
        <Avatar.Image size={40} source={faceImageSource} style={styles.thumbnail} />
        <View style={styles.cardText}>
          <Text variant="titleMedium">{item.memberName || t('common.unknown')}</Text>
          <View style={styles.detailsRow}> 
            {item.familyName ? <Text variant="bodySmall">{t('family.familyName')}: {item.familyName}</Text> : <></>}
            {item.confidence ? <Text variant="bodySmall">{t('faceSearch.confidence')}: {item.confidence.toFixed(2)}</Text> : <></>}
            {(item.birthYear || item.deathYear) &&
              <Text variant="bodySmall">
                ({item.birthYear || t('common.not_available')} - {item.deathYear || t('common.not_available')})
              </Text>
            }
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

export default memo(FaceItem);
