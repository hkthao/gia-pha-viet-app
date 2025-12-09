import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import DefaultFamilyAvatar from '@/assets/images/familyAvatar.png'; // Import default avatar
import { SPACING_MEDIUM } from '@/constants/dimensions';
import { DetectedFaceDto } from '@/types';

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
    alignItems: 'center', // Center vertically
  },
  thumbnail: {
    marginRight: SPACING_MEDIUM,
    borderRadius: theme.roundness, // Make it rounded or square
  },
  cardText: {
    flex: 1,
  },
});

const FaceItem = ({ item }: FaceItemProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const styles = getStyles(theme);

  // Fallback for thumbnail if not available
  const faceImageSource = item.thumbnail ? { uri: `data:image/jpeg;base64,${item.thumbnail}` } : DefaultFamilyAvatar;

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
        <Avatar.Image size={72} source={faceImageSource} style={styles.thumbnail} />
        <View style={styles.cardText}>
          <Text variant="titleMedium">{item.memberName || t('common.unknown')}</Text>
          {item.familyName && <Text variant="bodySmall">{t('family.familyName')}: {item.familyName}</Text>}
          {item.confidence && <Text variant="bodySmall">{t('faceSearch.confidence')}: {item.confidence.toFixed(2)}</Text>}
          {(item.birthYear || item.deathYear) && (
            <Text variant="bodySmall">
              ({item.birthYear || t('common.not_available')} - {item.deathYear || t('common.not_available')})
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

export default memo(FaceItem);