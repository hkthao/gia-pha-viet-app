// gia-pha-viet-app/hooks/chat/useAIChatImageUpload.ts

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageUploadResultDto } from '@/types';
import { AIChatServiceAdapter, defaultAIChatServiceAdapter } from './aiChat.adapters';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar'; // Import useGlobalSnackbar

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
  const { aiChatService = defaultAIChatServiceAdapter } = deps;
  const { showSnackbar } = useGlobalSnackbar(); // Use the snackbar hook
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
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
    // showLoading(); // Removed showLoading call

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
      showSnackbar(t('aiChat.uploadErrorMessage'), 'error'); // Use snackbar instead of Alert.alert
    } finally {
      // hideLoading(); // Removed hideLoading call
    }
  }, [aiChatService, t, showSnackbar]); // Removed showLoading, hideLoading from dependencies

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

  const isAnyFileUploading = useMemo(() => {
    return uploadedFiles.some(file => file.isUploading);
  }, [uploadedFiles]);

  return {
    uploadedFiles,
    isAnyFileUploading, // Re-added to here
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
