// gia-pha-viet-app/hooks/memory/useUpdateMemoryItem.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { memoryItemService } from '@/services';
import { MemoryItemUpdateRequestDto } from '@/types';

export const useUpdateMemoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updatedItem }: { id: string; updatedItem: MemoryItemUpdateRequestDto }) => {
      const result = await memoryItemService.update(id, updatedItem);
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(result.error?.message || `Failed to update memory item with ID: ${id}`);
    },
    onSuccess: (_, { id }) => {
      // Invalidate queries for memory item lists and the specific item to show updated data
      queryClient.invalidateQueries({ queryKey: ['memoryItems'] });
      queryClient.invalidateQueries({ queryKey: ['memoryItem', id] });
    },
  });
};
