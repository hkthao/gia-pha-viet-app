// gia-pha-viet-app/hooks/lists/useFamilyDictQueries.ts
import { useQuery } from '@tanstack/react-query';
import { familyDictService } from '@/services';
import type { FamilyDictDto, FamilyDictSearchQuery } from '@/types';
import { parseError } from '@/utils/errorUtils';

export const familyDictQueryKeys = {
  all: ['familyDicts'] as const,
  lists: () => [...familyDictQueryKeys.all, 'list'] as const,
  list: (filters: FamilyDictSearchQuery) => [...familyDictQueryKeys.lists(), { filters }] as const,
};

export const useSearchFamilyDictsQuery = (filters: FamilyDictSearchQuery) => {
  return useQuery<FamilyDictDto[], string>({
    queryKey: familyDictQueryKeys.list(filters),
    queryFn: async () => {
      const result = await familyDictService.search(filters);
      if (result.isSuccess && result.value) {
        return result.value.items; // Assuming search returns PaginatedList<FamilyDictDto>
      }
      throw new Error(parseError(result.error));
    },
  });
};