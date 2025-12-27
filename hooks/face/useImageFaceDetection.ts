import { useState, useEffect, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useCameraPermissions } from 'expo-camera';
import { faceService } from '@/services';
import type { DetectedFaceDto } from '@/types'; // Removed FaceStatus import
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { ImageDimensions } from '@/utils/faceUtils'; // Import from utility file

export interface UseImageFaceDetectionResult {
  image: string | null;
  base64Image: string | null; // Add this line
  imageDimensions: ImageDimensions | null;
  detectedFaces: DetectedFaceDto[];
  loading: boolean;
  error: string | null;
  pickImage: () => Promise<void>;
  takePhoto: () => Promise<void>;
  resetFaceDetection: () => void;
  // calculateBoundingBox is now imported and passed as is.
}

export function useImageFaceDetection(familyId: string | null, returnCrop: boolean = false): UseImageFaceDetectionResult {
  const { t } = useTranslation();

  const [image, setImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null); // Add this line
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const [detectedFaces, setDetectedFaces] = useState<DetectedFaceDto[]>([]);
  // Removed local loading and error states, will use useMutation's states

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();

  useEffect(() => {
    (async () => {
      await requestCameraPermission();
      await requestMediaLibraryPermission();
    })();
  }, [requestCameraPermission, requestMediaLibraryPermission]);

  // Use useMutation for face detection API call
  const detectFacesMutation = useMutation({
    mutationFn: async (selectedImage: ImagePicker.ImagePickerAsset) => {
      if (!familyId) {
        throw new Error(t('faceSearch.noFamilyIdSelected'));
      }
      if (!selectedImage.uri) {
        throw new Error(t('faceSearch.imageUriError'));
      }

      const fileName = selectedImage.fileName || selectedImage.uri.split('/').pop() || 'image.jpg';
      const fileType = selectedImage.mimeType || 'image/jpeg';

      const result = await faceService.detectFaces({
        fileUri: selectedImage.uri,
        fileName: fileName,
        fileType: fileType,
        familyId: familyId,
        returnCrop: returnCrop, // Use the passed returnCrop value
      });

      if (result.isSuccess && result.value && result.value.detectedFaces) {
        return result.value.detectedFaces;
      } else {
        throw new Error(result.error?.message || t('faceSearch.detectionFailed'));
      }
    },
    onSuccess: (data) => {
      setDetectedFaces(data); // Directly use data from server
    },
    onError: (err) => {
      console.error('Face detection API error:', err);
      // Error state is now managed by the mutation itself
    },
  });

  const pickImage = useCallback(async () => {
    // Clear previous results before picking new image
    setImage(null);
    setImageDimensions(null);
    setDetectedFaces([]);
    detectFacesMutation.reset(); // Reset mutation state

    if (!mediaLibraryPermission?.granted) {
      const { granted } = await requestMediaLibraryPermission();
      if (!granted) {
        detectFacesMutation.error = new Error(t('faceSearch.mediaLibraryPermissionDenied'));
        return;
      }
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      setImage(selectedImage.uri);
      setBase64Image(selectedImage.base64 ?? null);
      setImageDimensions({ width: selectedImage.width, height: selectedImage.height });
      detectFacesMutation.mutate(selectedImage);
    }
  }, [mediaLibraryPermission, requestMediaLibraryPermission, t, detectFacesMutation]);

  const takePhoto = useCallback(async () => {
    // Clear previous results before taking new photo
    setImage(null);
    setImageDimensions(null);
    setDetectedFaces([]);
    detectFacesMutation.reset(); // Reset mutation state

    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        detectFacesMutation.error = new Error(t('faceSearch.cameraPermissionDenied'));
        return;
      }
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      setImage(selectedImage.uri);
      setBase64Image(selectedImage.base64 ?? null);
      setImageDimensions({ width: selectedImage.width, height: selectedImage.height });
      detectFacesMutation.mutate(selectedImage);
    }
  }, [cameraPermission, requestCameraPermission, t, detectFacesMutation]);

  const clearImage = useCallback(() => {
    setImage(null);
    setBase64Image(null); // Add this line
    setImageDimensions(null);
    setDetectedFaces([]);
    detectFacesMutation.reset(); // Reset mutation state (loading, error, data)
  }, [detectFacesMutation]);

  return {
    image,
    base64Image, // Add this line
    imageDimensions,
    detectedFaces,
    loading: detectFacesMutation.isPending,
    error: detectFacesMutation.error ? detectFacesMutation.error.message : null,
    pickImage,
    takePhoto,
    resetFaceDetection: clearImage,
    // calculateBoundingBox, // Removed from here
  };
}
