// gia-pha-viet-app/hooks/memory/useCreateMemoryItem.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { memoryItemService } from '@/services';
import { MemoryItemCreateRequestDto } from '@/types';

export const useCreateMemoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newItem: MemoryItemCreateRequestDto) => {
      const result = await memoryItemService.create(newItem);
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(result.error?.message || 'Failed to create memory item');
    },
    onSuccess: () => {
      // Invalidate queries for memory item lists to show the new item
      queryClient.invalidateQueries({ queryKey: ['memoryItems'] });
    },
  });
};
