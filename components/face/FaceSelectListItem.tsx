// gia-pha-viet-app/components/face/FaceSelectListItem.tsx
import { View, StyleSheet } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
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
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPACING_SMALL,
      paddingHorizontal: SPACING_SMALL,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.outlineVariant,
    },
    faceInfo: {
      flex: 1,
      marginRight: SPACING_SMALL,
    },
    memberName: {
      color: face.memberId ? theme.colors.primary : theme.colors.error,
      fontWeight: 'bold',
    },
    confidence: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 12,
    },
    button: {
      borderRadius: theme.roundness,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.faceInfo}>
        <Text variant="bodyMedium" style={styles.memberName}>
          {memberName}
        </Text>
        <Text variant="bodySmall" style={styles.confidence}>
          {t('faceDataForm.confidence')}: {(face.confidence * 100).toFixed(2)}%
        </Text>
      </View>
      <Button
        mode="outlined"
        onPress={() => onPress(face)}
        compact
        style={styles.button}
      >
        {face.memberId ? t('faceDataForm.changeMember') : t('faceDataForm.assignMember')}
      </Button>
    </View>
  );
};

export default FaceSelectListItem;
