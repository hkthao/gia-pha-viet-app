// gia-pha-viet-app/hooks/memory/useMemoryItem.ts

import { useQuery } from '@tanstack/react-query';
import { memoryItemService } from '@/services';

export const useMemoryItem = (id: string | undefined) => {
  return useQuery({
    queryKey: ['memoryItem', id],
    queryFn: async () => {
      if (!id) {
        return undefined; // Or throw an error if an ID is strictly required
      }
      const result = await memoryItemService.getById(id);
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(result.error?.message || `Failed to fetch memory item with ID: ${id}`);
    },
    enabled: !!id, // Only run the query if id is provided
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
