// gia-pha-viet-app/hooks/memory/useDeleteMemoryItem.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { memoryItemService } from '@/services';
import { Result } from '@/types'; // Import Result type

export const useDeleteMemoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation<void, string, string>({
    mutationFn: async (id: string) => {
      const result: Result<void> = await memoryItemService.delete(id);
      if (result.isSuccess) {
        return result.value;
      } else {
        throw (result.error || 'Unknown error during deletion');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memoryItems'] });
      // Optionally invalidate a specific memory item if needed, but 'memoryItems' list is usually enough
      // queryClient.invalidateQueries(['memoryItem', id]);
    },
  });
};