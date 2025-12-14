import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { Appbar, useTheme, Text, Button, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { Svg, Rect, G, Text as SvgText } from 'react-native-svg';
import FaceSelectListItem from '@/components/face/FaceSelectListItem';
import { useCreateFaceData } from '@/hooks/face/useCreateFaceData';

export default function CreateFaceDataScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);
  const screenWidth = Dimensions.get('window').width;

  const {
    processing,
    detectedFacesWithMember,
    image,
    imageDimensions,
    detectionLoading,
    detectionError,
    handleImagePick,
    handleCancel,
    handlePressFaceToSelectMember,
    handleSubmit,
    calculateBoundingBox,
    SelectMemberModalComponent,
    saveMutationLoading,
    saveMutationError,
  } = useCreateFaceData();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flexGrow: 1,
      padding: SPACING_MEDIUM,
    },
    noFamilyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageContainer: {
      width: '100%',
      aspectRatio: 4 / 3,
      borderColor: theme.colors.outline,
      borderWidth: 0.5,
      borderRadius: theme.roundness,
      marginBottom: SPACING_MEDIUM,
      position: 'relative',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    selectImageButton: {
      marginBottom: SPACING_MEDIUM,
      borderRadius: theme.roundness,
    },
    facesListContainer: {
      marginTop: SPACING_MEDIUM,
    },
    facesListTitle: {
      marginBottom: SPACING_SMALL,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    saveButton: {
      marginTop: SPACING_MEDIUM,
      borderRadius: theme.roundness,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    }
  }), [theme]);

  if (!currentFamilyId) {
    return (
      <View style={styles.noFamilyContainer}>
        <Text>{t('faceSearch.noFamilyIdSelected')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleCancel} />
        <Appbar.Content title={t('faceDataForm.createTitle')} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        {(processing || saveMutationLoading) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator animating size="large" color={theme.colors.primary} />
            <Text style={{ color: theme.colors.onPrimary }}>{t('common.processing')}</Text>
          </View>
        )}

        <Button
          mode="contained"
          onPress={handleImagePick}
          disabled={detectionLoading || processing || saveMutationLoading}
          loading={detectionLoading}
          icon="camera-plus"
          style={styles.selectImageButton}
        >
          {t('faceDataForm.selectImage')}
        </Button>

        {image && imageDimensions && (
          <View
            style={styles.imageContainer}
          >
            <Image source={{ uri: image }} style={styles.image} />
            <Svg
              height="100%"
              width="100%"
              style={StyleSheet.absoluteFill}
            >
              {detectedFacesWithMember.map((face, index) => {
                const roundedScaledBox = calculateBoundingBox(face, { width: screenWidth - (SPACING_MEDIUM * 2), height: (screenWidth - (SPACING_MEDIUM * 2)) * (imageDimensions.height / imageDimensions.width) }, imageDimensions);

                if (!roundedScaledBox) {
                  return null;
                }

                const memberName = face.memberName || t('faceDataForm.unassigned');

                return (
                  <G
                    key={face.id}
                    onPress={() => handlePressFaceToSelectMember(face)}
                  >
                    <Rect
                      x={roundedScaledBox.scaledX}
                      y={roundedScaledBox.scaledY}
                      width={roundedScaledBox.scaledWidth}
                      height={roundedScaledBox.scaledHeight}
                      stroke={face.memberId ? theme.colors.primary : theme.colors.error}
                      strokeWidth="2"
                      fill="rgba(0,0,0,0)"
                    />
                    <Rect
                      x={roundedScaledBox.scaledX + roundedScaledBox.scaledWidth / 2 - (memberName.length * 3)}
                      y={roundedScaledBox.scaledY - 20}
                      width={memberName.length * 6 + 10}
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
                      {memberName}
                    </SvgText>
                  </G>
                );
              })}
            </Svg>
          </View>
        )}

        {(detectionError || saveMutationError) && (
          <Text style={{ color: theme.colors.error, textAlign: 'center', marginBottom: SPACING_MEDIUM }}>
            {detectionError || saveMutationError}
          </Text>
        )}

        {detectedFacesWithMember.length > 0 && (
          <View style={styles.facesListContainer}>
            <Text variant="titleMedium" style={styles.facesListTitle}>
              {t('faceDataForm.detectedFaces')}
            </Text>
            {detectedFacesWithMember.map((face) => (
              <FaceSelectListItem
                key={face.id}
                face={face}
                onPress={() => handlePressFaceToSelectMember(face)}
                t={t}
              />
            ))}
          </View>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={!image || detectedFacesWithMember.length === 0 || processing || saveMutationLoading || detectedFacesWithMember.some(face => !face.memberId)}
          loading={processing || saveMutationLoading}
          icon="content-save"
          style={styles.saveButton}
        >
          {t('common.save')}
        </Button>
      </ScrollView>

      <SelectMemberModalComponent />
    </View>
  );
}