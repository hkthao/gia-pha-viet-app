// apps/mobile/family_tree_rn/services/relationship/relationship.service.interface.ts

import { Result, DetectRelationshipResult } from '@/types';
import { RelationshipListDto } from '@/types';

export interface IRelationshipService {
  getRelationshipsByFamilyId(familyId: string): Promise<Result<RelationshipListDto[]>>;
  detectRelationship(familyId: string, memberAId: string, memberBId: string): Promise<DetectRelationshipResult>;
}

