import React from 'react'; // Removed useState
import { StyleSheet, View } from 'react-native'; // Removed Image
import { Text, useTheme, Button, Appbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import { useRouter } from 'expo-router';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { useImageFaceDetection } from '@/hooks/face/useImageFaceDetection';
import { FaceBoundingBoxes } from '@/components/face'; // Import FaceBoundingBoxes

export default function FamilyFaceSearchScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);

  const {
    image,
    imageDimensions,
    detectedFaces,
    loading,
    error,
    pickImage,
    takePhoto,
    calculateBoundingBox,
  } = useImageFaceDetection(currentFamilyId);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      padding: SPACING_MEDIUM,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: SPACING_MEDIUM,
      marginTop: SPACING_MEDIUM,
    },
    errorText: {
      color: theme.colors.error,
      marginTop: SPACING_MEDIUM,
      textAlign: 'center',
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('familyDetail.tab.faceSearchShort')} />
      </Appbar.Header>
      <View style={styles.container}>
        {error && <Text style={styles.errorText}>{error}</Text>}

        {image && imageDimensions && (
          <FaceBoundingBoxes
            image={image}
            imageDimensions={imageDimensions}
            detectedFaces={detectedFaces}
            calculateBoundingBox={calculateBoundingBox}
            onPressFace={(face) => router.push(`/member/${face.memberId}`)} // Navigate to member details on face press
          />
        )}

        {detectedFaces.length > 0 && <Text style={{ marginTop: SPACING_MEDIUM }}>{t('faceSearch.facesDetected', { count: detectedFaces.length })}</Text>}

        <View style={styles.buttonContainer}>
          <Button mode="contained" onPress={pickImage} loading={loading} disabled={loading} icon="image-multiple" style={{ borderRadius: theme.roundness }}>
            {t('faceSearch.pickImage')}
          </Button>
          <Button
            mode="contained" onPress={takePhoto} loading={loading} disabled={loading} icon="camera" style={{ borderRadius: theme.roundness }}>
            {t('faceSearch.takePhoto')}
          </Button>
        </View>
      </View>
    </View>
  );
}