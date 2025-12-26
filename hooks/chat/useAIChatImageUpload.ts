// gia-pha-viet-app/hooks/chat/useAIChatImageUpload.ts

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { nanoid } from 'nanoid';
import { ImageUploadResultDto } from '@/types';
import { MAX_UPLOAD_FILE_SIZE_BYTES, MAX_UPLOAD_FILE_SIZE_MB } from '@/constants/dimensions';
import { AIChatServiceAdapter, defaultAIChatServiceAdapter } from './aiChat.adapters';

// Define a type for local file representation
export interface UploadedFile extends ImageUploadResultDto {
  localUri: string;
  type: 'image' | 'pdf'; // Or other types
  isUploading?: boolean;
}

export interface UseAIChatImageUploadDeps {
  aiChatService?: AIChatServiceAdapter;
  familyId: string;
}

export function useAIChatImageUpload(deps: UseAIChatImageUploadDeps) {
  const { t } = useTranslation();
  const { aiChatService = defaultAIChatServiceAdapter, familyId } = deps;

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageViewerIndex, setCurrentImageViewerIndex] = useState(0);

  const handleImagePicked = useCallback(async (uri: string) => {
    const fileName = uri.split('/').pop() || `image-${Date.now()}.jpeg`;
    // For simplicity, assuming all picked files are images and have localUri as the path
    const tempFile: UploadedFile = {
      localUri: uri,
      title: fileName, // Use 'title' instead of 'name' for display
      type: 'image',
      isUploading: true,
      size: 0, height: 0, width: 0, // Placeholder values, will be updated by API response
    };
    setUploadedFiles((prev) => [...prev, tempFile]);
    setIsUploading(true);

    try {
      const uploadResult = await aiChatService.uploadImage(uri, fileName);
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.localUri === uri
            ? { ...file, ...uploadResult, isUploading: false }
            : file
        )
      );
    } catch (error: any) {
      console.error("Upload failed:", error);
      // Remove the failed upload and show error
      setUploadedFiles((prev) => prev.filter((file) => file.localUri !== uri));
      Alert.alert(t('common.error'), t('aiChat.uploadErrorMessage'));
    } finally {
      setIsUploading(false);
    }
  }, [aiChatService, t]);

  const handleRemoveFile = useCallback((fileToRemove: UploadedFile) => {
    setUploadedFiles((prev) => prev.filter((file) => file.localUri !== fileToRemove.localUri));
  }, []);

  const handleViewImage = useCallback((file: UploadedFile) => {
    const imageFiles = uploadedFiles.filter(f => f.type === 'image' && f.url);
    const index = imageFiles.findIndex(f => f.url === file.url);
    if (index !== -1) {
      setCurrentImageViewerIndex(index);
      setImageViewerVisible(true);
    }
  }, [uploadedFiles]);

  const imagesForViewer = useMemo(() => {
    return uploadedFiles
      .filter(f => f.type === 'image' && f.url)
      .map(f => ({ uri: f.url! }));
  }, [uploadedFiles]);

  const clearUploadedFiles = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  return {
    uploadedFiles,
    isUploading,
    imageViewerVisible,
    currentImageViewerIndex,
    imagesForViewer,
    handleImagePicked,
    handleRemoveFile,
    handleViewImage,
    setImageViewerVisible, // Expose setter for ImageViewing component
    clearUploadedFiles,
  };
}
