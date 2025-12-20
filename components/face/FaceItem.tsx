import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Chip, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { DetectedFaceDto } from '@/types';
import { getMemberAvatarSource } from '@/utils/imageUtils';

interface FaceItemProps {
  item: DetectedFaceDto;
  onPress?: () => void; // Add optional onPress prop
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
    marginTop: SPACING_SMALL,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

const FaceItem = ({ item, onPress }: FaceItemProps) => { // Accept onPress prop
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const styles = getStyles(theme);

  // Use getAvatarSource from imageUtils
  const faceImageSource = getMemberAvatarSource(item.thumbnailUrl);

  // Navigate to member details if memberId is available
  const handlePress = () => {
    if (onPress) { // If onPress prop is provided, use it
      onPress();
    } else if (item.memberId) {
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
          <View style={[styles.detailsRow, { gap: SPACING_SMALL }]}>
            {item.familyName ? (
              <Chip
                icon={({ size }: { size: number, color: string }) => (
                  <Avatar.Image
                    size={size}
                                         source={getMemberAvatarSource(item.familyAvatarUrl)}                    style={{ backgroundColor: 'transparent' }}
                  />
                )}
                compact
                style={{  backgroundColor: 'transparent', }}
              >
                {item.familyName}
              </Chip>
            ):<></>}
            {(item.birthYear || item.deathYear) && (
              <Chip
                icon="calendar"
                compact
                style={{  backgroundColor: 'transparent' }}
              >
                ({item.birthYear || t('common.not_available')} - {item.deathYear || t('common.not_available')})
              </Chip>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

export default memo(FaceItem);
