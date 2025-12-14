// gia-pha-viet-app/components/face/FaceSelectListItem.tsx
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text, useTheme, IconButton, List } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { DetectedFaceDto } from '@/types';
import { SPACING_SMALL } from '@/constants/dimensions';

interface FaceSelectListItemProps {
  face: DetectedFaceDto;
  onPress: (face: DetectedFaceDto) => void;
  t: (key: string) => string; // Pass t function from useTranslation
}

const FaceSelectListItem: React.FC<FaceSelectListItemProps> = ({ face, onPress, t }) => {
  const theme = useTheme();
  const memberName = face.memberName || t('faceDataForm.unassigned');

  const styles = StyleSheet.create({
    thumbnail: {
      width: 40,
      height: 40,
      borderRadius: theme.roundness,
      marginRight: SPACING_SMALL,
    },
    listItemContent: {
      flex: 1,
    },
    memberName: {
      color: face.memberId ? theme.colors.primary : theme.colors.error,
      fontWeight: 'bold',
    },
    confidence: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 12,
    },
  });

  const thumbnailSource = face.thumbnail
    ? { uri: `data:image/jpeg;base64,${face.thumbnail}` }
    : face.thumbnailUrl
      ? { uri: face.thumbnailUrl }
      : require('@/assets/images/familyAvatar.png'); // Placeholder image

  const yearInfo = (face.birthYear || face.deathYear)
    ? ` (${face.birthYear || ''}-${face.deathYear || ''})`
    : '';

  return (
    <List.Item
      title={memberName}
      description={yearInfo}
      left={() => (
        <Image
          source={thumbnailSource}
          style={styles.thumbnail}
        />
      )}
      right={() => (
        <IconButton
          icon="account-edit" // Edit icon
          onPress={() => onPress(face)}
          iconColor={theme.colors.onSurface}
        />
      )}
      onPress={() => onPress(face)} // Allow pressing the whole item
      style={{ backgroundColor: theme.colors.surface, paddingVertical: 0 }}
      titleStyle={styles.memberName}
      descriptionStyle={styles.confidence}
    />
  );
};

export default FaceSelectListItem;
