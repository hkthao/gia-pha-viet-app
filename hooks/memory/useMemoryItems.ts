// gia-pha-viet-app/hooks/memory/useMemoryItems.ts

import { useQuery } from '@tanstack/react-query';
import { memoryItemService } from '@/services';
import { SearchMemoryItemsQuery } from '@/types';

export const useMemoryItems = (filter: SearchMemoryItemsQuery) => {
  return useQuery({
    queryKey: ['memoryItems', filter],
    queryFn: async () => {
      const result = await memoryItemService.search(filter);
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(result.error?.message || 'Failed to fetch memory items');
    },
    // Keep data in cache for 5 minutes, and refetch in the background if older than 1 minute
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60,   // 1 hour
  });
};
