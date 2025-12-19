// gia-pha-viet-app/hooks/memory/useUpdateMemoryItem.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { memoryItemService, familyMediaService } from '@/services';
import { MemoryItemUpdateRequestDto, MemoryMediaDto } from '@/types';
import { createAndUploadFile, uploadFileFromUri } from '@/utils/fileUploadUtils';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar';
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore';

export const useUpdateMemoryItem = () => {
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

  return useMutation({
    mutationFn: async ({ id, updatedItem }: { id: string; updatedItem: MemoryItemUpdateRequestDto }) => {
      if (!currentFamilyId) {
        throw new Error(t('memory.selectFamilyPrompt'));
      }

      const updatedMemoryMedia: MemoryMediaDto[] = [];
      if (updatedItem.memoryMedia && updatedItem.memoryMedia.length > 0) {
        for (const media of updatedItem.memoryMedia) {
          if (media.url === undefined) {
            updatedMemoryMedia.push(media);
            continue;
          }

          if (media.isNew) {
            const fileName = media.url!.startsWith('data:') ? `memory_media_${Date.now()}.jpg` : media.url!.split('/').pop() || `memory_media_${Date.now()}.jpg`;
            let mediaType = 'image/jpeg';

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
              throw new Error(t('memoryForm.unsupportedMediaUri'));
            }
            updatedMemoryMedia.push({ id: media.id, url: uploadedUrl });
          } else {
            updatedMemoryMedia.push(media);
          }
        }
      }

      const newMemoryItemWithUploadedMedia = {
        ...updatedItem,
        memoryMedia: updatedMemoryMedia,
      };

      const result = await memoryItemService.update(id, newMemoryItemWithUploadedMedia);
      if (result.isSuccess) {
        return result.value ?? newMemoryItemWithUploadedMedia; // Return value if present, else the updated item itself
      }
      throw new Error(result.error?.message || t('memoryForm.updateError'));
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['memoryItems'] });
      queryClient.invalidateQueries({ queryKey: ['memoryItem', id] });
      showSnackbar(t('memoryForm.updateSuccess'), 'success');
    },
    onError: (err: any) => {
      showSnackbar(err.message || t('memoryForm.updateError'), 'error');
    },
  });
};
