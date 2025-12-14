// gia-pha-viet-app/hooks/face/useCreateFaceData.ts
import { useState, useCallback, useEffect } from 'react';
import { Alert, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';

import { DetectedFaceDto, MemberListDto, CreateFaceDataRequestDto } from '@/types';
import { faceService } from '@/services';
import { useImageFaceDetection } from '@/hooks/face/useImageFaceDetection';
import { useMemberSelectModal } from '@/hooks/ui/useMemberSelectModal';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { SPACING_MEDIUM } from '@/constants/dimensions';

interface UseCreateFaceDataResult {
  processing: boolean;
  detectedFacesWithMember: DetectedFaceDto[];
  selectedFaceForMemberMapping: DetectedFaceDto | null;
  image: string | null;
  imageDimensions: { width: number; height: number } | null;
  detectionLoading: boolean;
  detectionError: string | null;
  handleImagePick: () => void;
  handleCancel: () => void;
  handlePressFaceToSelectMember: (face: DetectedFaceDto) => void;
  handleSubmit: () => Promise<void>;
  calculateBoundingBox: (
    face: DetectedFaceDto,
    containerDimensions: { width: number; height: number },
    imageDimensions: { width: number; height: number }
  ) => { scaledX: number; scaledY: number; scaledWidth: number; scaledHeight: number; offsetX: number; offsetY: number } | null;
  SelectMemberModalComponent: React.FC;
  saveMutationLoading: boolean;
  saveMutationError: string | null;
}

export function useCreateFaceData(): UseCreateFaceDataResult {
  const { t } = useTranslation();
  const router = useRouter();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);

  const [detectedFacesWithMember, setDetectedFacesWithMember] = useState<DetectedFaceDto[]>([]);
  const [selectedFaceForMemberMapping, setSelectedFaceForMemberMapping] = useState<DetectedFaceDto | null>(null);

  const {
    image,
    imageDimensions,
    detectedFaces,
    loading: detectionLoading,
    error: detectionError,
    pickImage,
    takePhoto,
    calculateBoundingBox,
    resetFaceDetection,
  } = useImageFaceDetection(currentFamilyId);

  const {
    showMemberSelectModal,
    MemberSelectModal: SelectMemberModalComponent
  } = useMemberSelectModal();

  // Initialize detectedFacesWithMember when detectedFaces changes from useImageFaceDetection
  useEffect(() => {
    if (detectedFaces && detectedFaces.length > 0) {
      setDetectedFacesWithMember(detectedFaces.map(face => ({ ...face, memberId: undefined, memberName: undefined })));
    } else {
      setDetectedFacesWithMember([]);
    }
  }, [detectedFaces]);

  const saveFaceDataMutation = useMutation({
    mutationFn: async (payload: CreateFaceDataRequestDto) => {
      const result = await faceService.create(payload);
      if (result.isSuccess) {
        return result.value;
      } else {
        throw new Error(result.error?.message || t('faceDataForm.saveError'));
      }
    },
    onSuccess: () => {
      Alert.alert(t('common.success'), t('faceDataForm.saveSuccess'));
      router.back();
    },
    onError: (err) => {
      console.error('Error saving face data:', err);
      Alert.alert(t('common.error'), err.message);
    },
  });

  const handleImagePick = useCallback(() => {
    Alert.alert(
      t('faceDataForm.selectImageSource'),
      '',
      [
        { text: t('faceDataForm.takePhoto'), onPress: async () => {
          resetFaceDetection();
          await takePhoto();
        } },
        { text: t('faceDataForm.chooseFromLibrary'), onPress: async () => {
          resetFaceDetection();
          await pickImage();
        } },
        { text: t('common.cancel'), style: 'cancel' },
      ],
      { cancelable: true }
    );
  }, [pickImage, takePhoto, t, resetFaceDetection]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleMemberSelected = useCallback((member: MemberListDto, faceIdBeingMapped: string) => {
    if (member) {
      setDetectedFacesWithMember(prevFaces =>
        prevFaces.map(face =>
          face.id === faceIdBeingMapped
            ? { ...face, memberId: member.id, memberName: member.fullName }
            : face
        )
      );
    }
    setSelectedFaceForMemberMapping(null); // Close modal
  }, []);

  const handlePressFaceToSelectMember = useCallback((face: DetectedFaceDto) => {
    setSelectedFaceForMemberMapping(face); // Still set for potential UI indication or other use
    showMemberSelectModal((member: MemberListDto, fieldName: string) => handleMemberSelected(member, fieldName), face.id); // Pass face.id as the fieldName
  }, [showMemberSelectModal, handleMemberSelected]);

  const handleSubmit = useCallback(async () => {
    if (!currentFamilyId || !image || detectedFacesWithMember.length === 0) {
      Alert.alert(t('common.error'), t('faceDataForm.noDataToSave'));
      return;
    }
    if (detectedFacesWithMember.some(face => !face.memberId)) {
      Alert.alert(t('common.error'), t('faceDataForm.unassignedFacesError'));
      return;
    }

    const payload: CreateFaceDataRequestDto = {
      familyId: currentFamilyId,
      imageUrl: image,
      detectedFaces: detectedFacesWithMember.map(face => ({
        faceId: face.id,
        boundingBox: face.boundingBox,
        confidence: face.confidence,
        memberId: face.memberId!, // Assert non-null after check
      })),
    };

    saveFaceDataMutation.mutate(payload);
  }, [currentFamilyId, image, detectedFacesWithMember, saveFaceDataMutation, t]);

  const processing = detectionLoading || saveFaceDataMutation.isPending;

  return {
    processing,
    detectedFacesWithMember,
    selectedFaceForMemberMapping,
    image,
    imageDimensions,
    detectionLoading,
    detectionError: detectionError || saveFaceDataMutation.error?.message || null,
    handleImagePick,
    handleCancel,
    handlePressFaceToSelectMember,
    handleSubmit,
    calculateBoundingBox,
    SelectMemberModalComponent,
    saveMutationLoading: saveFaceDataMutation.isPending,
    saveMutationError: saveFaceDataMutation.error?.message || null,
  };
}