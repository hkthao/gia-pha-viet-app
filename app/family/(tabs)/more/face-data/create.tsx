import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native'; // Removed Image, Dimensions
import { Appbar, useTheme, Text, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { useFamilyStore } from '@/stores/useFamilyStore';
import FaceSelectListItem from '@/components/face/FaceSelectListItem';
import { FaceBoundingBoxes } from '@/components/face'; // Import FaceBoundingBoxes
import { useCreateFaceData } from '@/hooks/face/useCreateFaceData';

export default function CreateFaceDataScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);

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

        <FaceBoundingBoxes
          image={image}
          imageDimensions={imageDimensions}
          detectedFaces={detectedFacesWithMember}
          calculateBoundingBox={calculateBoundingBox}
          onPressFace={handlePressFaceToSelectMember}
        />

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
            {detectedFacesWithMember.map((face, index) => (
              <React.Fragment key={face.id}>
                <FaceSelectListItem
                  face={face}
                  onPress={() => handlePressFaceToSelectMember(face)}
                  t={t}
                />
                {index < detectedFacesWithMember.length - 1 && <Divider />}
              </React.Fragment>
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