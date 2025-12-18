// gia-pha-viet-app/hooks/relationship/useRelationshipQueries.ts
import { useQuery } from '@tanstack/react-query';
import { relationshipService } from '@/services';
import type { RelationshipListDto, DetectRelationshipResult } from '@/types';
import { parseError } from '@/utils/errorUtils';

export const relationshipQueryKeys = {
  all: ['relationships'] as const,
  lists: () => [...relationshipQueryKeys.all, 'list'] as const,
  listByFamily: (familyId: string) => [...relationshipQueryKeys.lists(), familyId] as const,
  detection: (familyId: string, memberAId: string, memberBId: string) => [...relationshipQueryKeys.all, 'detection', familyId, memberAId, memberBId] as const,
};

// Hook for getting relationships by family ID
export const useGetRelationshipsByFamilyIdQuery = (familyId: string, enabled: boolean = true) => {
  return useQuery<RelationshipListDto[], string>({
    queryKey: relationshipQueryKeys.listByFamily(familyId),
    queryFn: async () => {
      const result = await relationshipService.getRelationshipsByFamilyId(familyId);
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(parseError(result.error));
    },
    enabled: !!familyId && enabled,
  });
};

// Hook for detecting relationship
export const useDetectRelationshipQuery = (familyId: string, memberAId: string, memberBId: string, enabled: boolean = true) => {
  return useQuery<DetectRelationshipResult, string>({
    queryKey: relationshipQueryKeys.detection(familyId, memberAId, memberBId),
    queryFn: async () => {
      const result = await relationshipService.detectRelationship(familyId, memberAId, memberBId);
      return result;
    },
    enabled: !!familyId && !!memberAId && !!memberBId && enabled,
  });
};
