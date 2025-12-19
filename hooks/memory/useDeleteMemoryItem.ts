// gia-pha-viet-app/hooks/memory/useDeleteMemoryItem.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { memoryItemService } from '@/services';

export const useDeleteMemoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await memoryItemService.delete(id);
      if (result.isSuccess) {
        return true;
      }
      throw new Error(result.error?.message || `Failed to delete memory item with ID: ${id}`);
    },
    onSuccess: () => {
      // Invalidate queries for memory item lists to reflect the deletion
      queryClient.invalidateQueries({ queryKey: ['memoryItems'] });
    },
  });
};
