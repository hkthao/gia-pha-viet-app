import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { DetectedFaceDto, MemberListDto, CreateFaceDataRequestDto, FaceStatus } from '@/types';
import { faceService, familyMediaService } from '@/services'; // Import familyMediaService
import { useImageFaceDetection } from '@/hooks/face/useImageFaceDetection';
import { useMemberSelectModal } from '@/hooks/ui/useMemberSelectModal';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { File, Paths } from 'expo-file-system';
import { Buffer } from 'buffer';

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
  handleDeleteFace: (face: DetectedFaceDto) => void;
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
  const [isProcessing, setIsProcessing] = useState(false); // Changed to state variable

  const {
    image,
    imageDimensions,
    detectedFaces,
    base64Image, // Add this line
    loading: detectionLoading,
    error: detectionError,
    pickImage,
    takePhoto,
    calculateBoundingBox,
    resetFaceDetection,
  } = useImageFaceDetection(currentFamilyId, true); // Pass returnCrop as true

  const {
    showMemberSelectModal,
    MemberSelectModal: SelectMemberModalComponent
  } = useMemberSelectModal();

  // Initialize detectedFacesWithMember when detectedFaces changes from useImageFaceDetection
  useEffect(() => {
    if (detectedFaces && detectedFaces.length > 0) {
      setDetectedFacesWithMember(detectedFaces.map(face => ({
        ...face,
        memberId: face.memberId || undefined, // Keep existing memberId if any
        memberName: face.memberName || undefined, // Keep existing memberName if any
        status: face.status || (face.memberId ? FaceStatus.OriginalRecognized : FaceStatus.Unrecognized), // Use existing status or derive
        originalImageUri: image, // Store the original image URI for potential upload
      })));
    } else {
      setDetectedFacesWithMember([]);
    }
  }, [detectedFaces, image]); // Added image to dependencies

  // Mutation for uploading images
  const uploadImageMutation = useMutation({
    mutationFn: async ({ file, familyId, description, folder }: { file: { uri: string; name: string; type: string; }, familyId: string, description?: string, folder?: string }) => {
      const createResult = await familyMediaService.create({
        familyId,
        file,
        description,
        folder,
      });
      if (createResult.isSuccess) {
        return createResult.value!.filePath; // Return the URL
      } else {
        throw new Error(createResult.error?.message || t('faceDataForm.uploadImageError'));
      }
    }
  });


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
        {
          text: t('faceDataForm.takePhoto'), onPress: async () => {
            resetFaceDetection();
            await takePhoto();
          }
        },
        {
          text: t('faceDataForm.chooseFromLibrary'), onPress: async () => {
            resetFaceDetection();
            await pickImage();
          }
        },
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
            ? { ...face, memberId: member.id, memberName: member.fullName, status: FaceStatus.NewlyLabeled } // Update status
            : face
        )
      );
    }
    setSelectedFaceForMemberMapping(null); // Close modal
  }, []);

  const handlePressFaceToSelectMember = useCallback((face: DetectedFaceDto) => {
    if (face.status && [FaceStatus.Recognized, FaceStatus.OriginalRecognized].includes(face.status)) {
      // If recognized, do not allow changing member here directly.
      // This is for unrecognized faces to be assigned.
      Alert.alert(t('common.error'), t('faceDataForm.recognizedFaceCannotBeAssigned')); // New translation key
      return;
    }
    setSelectedFaceForMemberMapping(face); // Still set for potential UI indication or other use
    showMemberSelectModal((member: MemberListDto, fieldName: string) => handleMemberSelected(member, fieldName), face.id); // Pass face.id as the fieldName
  }, [showMemberSelectModal, handleMemberSelected, t]); // Added t to dependencies

  const handleSubmit = useCallback(async () => {
    if (!currentFamilyId || !image || detectedFacesWithMember.length === 0) {
      Alert.alert(t('common.error'), t('faceDataForm.noDataToSave'));
      return;
    }
    if (detectedFacesWithMember.some(face => !face.memberId)) {
      Alert.alert(t('common.error'), t('faceDataForm.unassignedFacesError'));
      return;
    }

    let finalImageUrl = image;
    const facesToProcess = [...detectedFacesWithMember]; // Create a mutable copy

    setIsProcessing(true); // Start processing for uploads and save
    try {
      // 1. Upload Original Image if an image is available
      if (image && base64Image) { // Ensure an image and its base64 content exist
        const fileName = image.startsWith('data:') ? `original_image_${Date.now()}.jpg` : image.split('/').pop() || `original_image_${Date.now()}.jpg`;
        let mediaType = 'image/jpeg'; // Default to jpeg, try to infer from data URI if available

        // If the original image URI is a data URI, infer mediaType from it
        if (image.startsWith('data:')) {
          const mimePart = image.split(';')[0];
          if (mimePart.includes(':')) {
            mediaType = mimePart.split(':')[1];
          }
        }
        const file = new File(Paths.cache, fileName);
        const bytes = Uint8Array.from(
          Buffer.from(base64Image, 'base64')
        );
        file.create({
          overwrite: true
        });
        file.write(bytes);

        const uploadedOriginalImageUrl = await uploadImageMutation.mutateAsync({
          file: {
            uri: file.uri,
            name: fileName,
            type: mediaType,
          },
          familyId: currentFamilyId,
          folder: 'faces/original-images',
        });
        file.delete()
        finalImageUrl = uploadedOriginalImageUrl;
      }

      // 2. Upload Newly Labeled Face Crops
      for (const face of facesToProcess) {
        if (face.status === FaceStatus.NewlyLabeled && face.thumbnail) {
          const thumbnailFileName = `face_thumb_${face.id}.jpg`;
          let thumbnailMediaType = 'image/jpeg'; // Assuming JPEG

          // If face.thumbnail is a data URI, infer mediaType from it
          if (face.thumbnail.startsWith('data:')) {
            const mimePart = face.thumbnail.split(';')[0];
            if (mimePart.includes(':')) {
              thumbnailMediaType = mimePart.split(':')[1];
            }
          }

          const file = new File(Paths.cache, thumbnailFileName);
          file.create({
            overwrite: true
          });
          const bytes = Uint8Array.from(
            Buffer.from(face.thumbnail, 'base64')
          );
          file.write(bytes);

          const uploadedThumbnailUrl = await uploadImageMutation.mutateAsync({
            file: {
              uri: file.uri, // Use the temporary file:// URI
              name: thumbnailFileName,
              type: thumbnailMediaType,
            },
            familyId: currentFamilyId,
            folder: 'faces/thumbnails',
          });
          file.delete()

          // 3. Prepare payload for faceService.create
          const payload: CreateFaceDataRequestDto = {
            familyId: currentFamilyId,
            imageUrl: finalImageUrl!, // Assert non-null after upload
            faceId: face.id,
            boundingBox: face.boundingBox,
            confidence: face.confidence,
            memberId: face.memberId!,
            thumbnailUrl: uploadedThumbnailUrl, // Include uploaded thumbnail URL
          };

          await saveFaceDataMutation.mutateAsync(payload);
        }
      }


    } catch (err: any) {
      console.error('Error during handleSubmit:', err);
      Alert.alert(t('common.error'), err.message || t('faceDataForm.saveError'));
    } finally {
      setIsProcessing(false);
    }
  }, [currentFamilyId, image, detectedFacesWithMember, uploadImageMutation, saveFaceDataMutation, t]);

  const handleDeleteFace = useCallback((faceToDelete: DetectedFaceDto) => {
    Alert.alert(
      t('common.confirm'),
      t('faceDataForm.confirmDeleteFace'), // New translation key needed
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            setDetectedFacesWithMember(prevFaces =>
              prevFaces.filter(face => face.id !== faceToDelete.id)
            );
          },
        },
      ],
      { cancelable: true }
    );
  }, [t]);

  const processing = isProcessing || detectionLoading || saveFaceDataMutation.isPending || uploadImageMutation.isPending;

  return {
    processing,
    detectedFacesWithMember,
    selectedFaceForMemberMapping,
    image,
    imageDimensions,
    detectionLoading,
    detectionError: detectionError || saveFaceDataMutation.error?.message || uploadImageMutation.error?.message || null, // Include upload error
    handleImagePick,
    handleCancel,
    handlePressFaceToSelectMember,
    handleDeleteFace, // Expose new handler
    handleSubmit,
    calculateBoundingBox,
    SelectMemberModalComponent,
    saveMutationLoading: saveFaceDataMutation.isPending,
    saveMutationError: saveFaceDataMutation.error?.message || null,
  };
}