// gia-pha-viet-app/hooks/memory/useCreateMemoryItem.ts

import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { memoryItemService, familyMediaService } from '@/services';
import { MemoryItemCreateRequestDto, MemoryMediaDto } from '@/types';
import { createAndUploadFile, uploadFileFromUri } from '@/utils/fileUploadUtils';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar';
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore';

export const useCreateMemoryItem = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showSnackbar } = useGlobalSnackbar();
  const { currentFamilyId } = useCurrentFamilyStore();

  const uploadMediaMutation = useMutation({
    mutationFn: async ({ file, familyId, description, folder }: { file: { uri: string; name: string; type: string; }, familyId: string, description?: string, folder?: string }) => {
      const createResult = await familyMediaService.create({
        familyId,
        file,
        description,
        folder,
      });
      if (createResult.isSuccess) {
        return createResult.value!.filePath;
      } else {
        throw new Error(createResult.error?.message || t('memoryForm.uploadMediaError'));
      }
    }
  });

  const createMemoryItemMutation = useMutation({
    mutationFn: async (newItem: MemoryItemCreateRequestDto) => {
      if (!currentFamilyId) {
        throw new Error(t('memory.selectFamilyPrompt'));
      }
      const updatedMemoryMedia: MemoryMediaDto[] = [];
      if (newItem.memoryMedia && newItem.memoryMedia.length > 0) {
        for (const media of newItem.memoryMedia) {
          if (media.url === undefined) {
            updatedMemoryMedia.push(media);
            continue;
          }
          // Only upload if media is new
          if (media.isNew) {
            const fileName = media.url!.startsWith('data:') ? `memory_media_${Date.now()}.jpg` : media.url!.split('/').pop() || `memory_media_${Date.now()}.jpg`;
            let mediaType = 'image/jpeg'; // Default, try to infer from data URI

            let uploadedUrl: string;
            if (media.url!.startsWith('data:')) {
              let base64Content = media.url!;
              const mimePart = media.url!.split(';')[0];
              if (mimePart.includes(':')) {
                mediaType = mimePart.split(':')[1];
              }
              uploadedUrl = await createAndUploadFile({
                base64Content: base64Content,
                fileName: fileName,
                mediaType: mediaType,
                familyId: currentFamilyId,
                folder: 'memory-media',
                uploadMutation: uploadMediaMutation,
              });
            } else if (media.url!.startsWith('file://')) {
              uploadedUrl = await uploadFileFromUri({
                fileUri: media.url!,
                fileName: fileName,
                mediaType: mediaType,
                familyId: currentFamilyId,
                folder: 'memory-media',
                uploadMutation: uploadMediaMutation,
              });
            } else {
              // This case should ideally not be reached if isNew is true and url is not undefined
              // but still handle it to be safe
              throw new Error(t('memoryForm.unsupportedMediaUri'));
            }
            updatedMemoryMedia.push({ id: media.id, url: uploadedUrl });
          } else {
            // Already an uploaded URL or not new, just push as is
            updatedMemoryMedia.push(media);
          }
        }
      }

      const newMemoryItemWithUploadedMedia = {
        ...newItem,
        memoryMedia: updatedMemoryMedia,
      };

      const result = await memoryItemService.create(newMemoryItemWithUploadedMedia);
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(result.error?.message || t('memoryForm.createError'));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memoryItems'] });
      showSnackbar(t('memoryForm.createSuccess'), 'success');
    },
    onError: (err: any) => {
      showSnackbar(err.message || t('memoryForm.createError'), 'error');
    },
  });

  const processing = createMemoryItemMutation.isPending || uploadMediaMutation.isPending;

  return {
    ...createMemoryItemMutation,
    processing,
  };
};
