import React, { useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { Svg, Rect, Text as SvgText, G } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import { useRouter } from 'expo-router';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { useImageFaceDetection } from '@/hooks/face/useImageFaceDetection';

export default function FamilyFaceSearchScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);

  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number } | null>(null);

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
    imageContainer: {
      width: '100%',
      aspectRatio: 4 / 3,
      borderColor: theme.colors.outline,
      borderWidth: 0.5,
      borderRadius: theme.roundness,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
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
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {image && imageDimensions && (
        <View
          style={styles.imageContainer}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setContainerDimensions({ width, height });
          }}
        >
          <Image source={{ uri: image }} style={styles.image} />
          {containerDimensions && (
            <Svg
              height={containerDimensions.height}
              width={containerDimensions.width}
              style={StyleSheet.absoluteFill}
            >
              {detectedFaces.map((face, index) => {
                if (!face.memberName) {
                  return null; // Skip rendering if no member name is associated
                }

                const roundedScaledBox = calculateBoundingBox(face, containerDimensions, imageDimensions);

                if (!roundedScaledBox) {
                  console.warn('Invalid bounding box or scaling parameter detected, skipping face rendering.');
                  return null;
                }

                return (
                  <G
                    key={index}
                    onPress={() => router.push(`/member/${face.memberId}`)}
                  >
                    <Rect
                      x={roundedScaledBox.scaledX}
                      y={roundedScaledBox.scaledY}
                      width={roundedScaledBox.scaledWidth}
                      height={roundedScaledBox.scaledHeight}
                      stroke={theme.colors.primary}
                      strokeWidth="2"
                      fill="rgba(0,0,0,0)"
                    />
                    <Rect
                      x={roundedScaledBox.scaledX + roundedScaledBox.scaledWidth / 2 - (face.memberName.length * 3)}
                      y={roundedScaledBox.scaledY - 20}
                      width={face.memberName.length * 6 + 10}
                      height="20"
                      fill="rgba(0,0,0,0.5)"
                      rx="3"
                      ry="3"
                    />
                    <SvgText
                      x={roundedScaledBox.scaledX + roundedScaledBox.scaledWidth / 2}
                      y={roundedScaledBox.scaledY - 5}
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {face.memberName}
                    </SvgText>
                  </G>
                );
              })}
            </Svg>
          )}
        </View>
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
  );
}