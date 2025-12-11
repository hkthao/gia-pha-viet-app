import { useState, useEffect, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useCameraPermissions } from 'expo-camera';
import { faceService } from '@/services';
import type { DetectedFaceDto } from '@/types';
import { useTranslation } from 'react-i18next';

interface ImageDimensions {
  width: number;
  height: number;
}

interface BoundingBoxCalculation {
  scaledX: number;
  scaledY: number;
  scaledWidth: number;
  scaledHeight: number;
  offsetX: number;
  offsetY: number;
}

export interface UseImageFaceDetectionResult {
  image: string | null;
  imageDimensions: ImageDimensions | null;
  detectedFaces: DetectedFaceDto[];
  loading: boolean;
  error: string | null;
  pickImage: () => Promise<void>;
  takePhoto: () => Promise<void>;
  clearImage: () => void;
  calculateBoundingBox: (
    face: DetectedFaceDto,
    containerDimensions: ImageDimensions,
    imageDimensions: ImageDimensions
  ) => BoundingBoxCalculation | null;
}

export function useImageFaceDetection(familyId: string | null): UseImageFaceDetectionResult {
  const { t } = useTranslation();

  const [image, setImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const [detectedFaces, setDetectedFaces] = useState<DetectedFaceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();

  useEffect(() => {
    (async () => {
      await requestCameraPermission();
      await requestMediaLibraryPermission();
    })();
  }, [requestCameraPermission, requestMediaLibraryPermission]);

  const processImage = useCallback(async (selectedImage: ImagePicker.ImagePickerAsset) => {
    if (!familyId) {
      setError(t('faceSearch.noFamilyIdSelected'));
      return;
    }

    setImage(selectedImage.uri);
    setImageDimensions({ width: selectedImage.width, height: selectedImage.height });
    setLoading(true);
    setDetectedFaces([]);
    setError(null);

    try {
      if (selectedImage.uri) {
        const fileName = selectedImage.fileName || selectedImage.uri.split('/').pop() || 'image.jpg';
        const fileType = selectedImage.mimeType || 'image/jpeg';

        const result = await faceService.detectFaces({
          fileUri: selectedImage.uri,
          fileName: fileName,
          fileType: fileType,
          familyId: familyId,
          returnCrop: false,
        });

        if (result.isSuccess && result.value && result.value.detectedFaces) {
          setDetectedFaces(result.value.detectedFaces);
        } else {
          setError(result.error?.message || t('faceSearch.detectionFailed'));
        }
      } else {
        setError(t('faceSearch.imageUriError'));
      }
    } catch (err: any) {
      console.error('Face detection API error:', err);
      setError(err.message || t('faceSearch.detectionFailed'));
    } finally {
      setLoading(false);
    }
  }, [familyId, t]);

  const pickImage = useCallback(async () => {
    if (!mediaLibraryPermission?.granted) {
      const { granted } = await requestMediaLibraryPermission();
      if (!granted) {
        setError(t('faceSearch.mediaLibraryPermissionDenied'));
        return;
      }
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      await processImage(result.assets[0]);
    }
  }, [mediaLibraryPermission, requestMediaLibraryPermission, processImage, t]);

  const takePhoto = useCallback(async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        setError(t('faceSearch.cameraPermissionDenied'));
        return;
      }
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      await processImage(result.assets[0]);
    }
  }, [cameraPermission, requestCameraPermission, processImage, t]);

  const clearImage = useCallback(() => {
    setImage(null);
    setImageDimensions(null);
    setDetectedFaces([]);
    setError(null);
    setLoading(false);
  }, []);

  const calculateBoundingBox = useCallback(
    (
      face: DetectedFaceDto,
      containerDimensions: ImageDimensions,
      currentImageDimensions: ImageDimensions
    ): BoundingBoxCalculation | null => {
      if (!currentImageDimensions || !containerDimensions || !face.boundingBox) {
        return null;
      }

      const imageAspectRatio = currentImageDimensions.width / currentImageDimensions.height;
      const containerAspectRatio = containerDimensions.width / containerDimensions.height;

      let actualImageRenderedWidth = 0;
      let actualImageRenderedHeight = 0;
      let offsetX = 0;
      let offsetY = 0;

      if (imageAspectRatio > containerAspectRatio) {
        actualImageRenderedWidth = containerDimensions.width;
        actualImageRenderedHeight = containerDimensions.width / imageAspectRatio;
        offsetY = (containerDimensions.height - actualImageRenderedHeight) / 2;
      } else {
        actualImageRenderedHeight = containerDimensions.height;
        actualImageRenderedWidth = containerDimensions.height * imageAspectRatio;
        offsetX = (containerDimensions.width - actualImageRenderedWidth) / 2;
      }

      const scaleX = actualImageRenderedWidth / currentImageDimensions.width;
      const scaleY = actualImageRenderedHeight / currentImageDimensions.height;

      const box = face.boundingBox;

      const scaledX = box.x * scaleX;
      const scaledY = box.y * scaleY;
      const scaledWidth = box.width * scaleX;
      const scaledHeight = box.height * scaleY;

      const finalX = scaledX + offsetX;
      const finalY = scaledY + offsetY;

      return {
        scaledX: parseFloat(finalX.toFixed(2)),
        scaledY: parseFloat(finalY.toFixed(2)),
        scaledWidth: parseFloat(scaledWidth.toFixed(2)),
        scaledHeight: parseFloat(scaledHeight.toFixed(2)),
        offsetX,
        offsetY,
      };
    },
    []
  );

  return {
    image,
    imageDimensions,
    detectedFaces,
    loading,
    error,
    pickImage,
    takePhoto,
    clearImage,
    calculateBoundingBox,
  };
}
