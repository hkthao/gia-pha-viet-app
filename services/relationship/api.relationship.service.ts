// apps/mobile/family_tree_rn/services/relationship/api.relationship.service.ts

import { ApiClientMethods, DetectRelationshipResult, Result, ApiError, RelationshipListDto } from '@/types';
import { IRelationshipService } from '@/services/relationship/relationship.service.interface';

export class ApiRelationshipService implements IRelationshipService {
  constructor(private api: ApiClientMethods) {}

  async getRelationshipsByFamilyId(familyId: string): Promise<Result<RelationshipListDto[]>> {
    try {
      const response = await this.api.get<RelationshipListDto[]>(`/relationship/by-family/${familyId}`);
      return { isSuccess: true, value: response };
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
        statusCode: error.response?.status,
      };
      return { isSuccess: false, error: apiError };
    }
  }

  async detectRelationship(familyId: string, memberAId: string, memberBId: string): Promise<DetectRelationshipResult> {
    try {
      const response = await this.api.get<DetectRelationshipResult>(
        `/relationship/detect-relationship?familyId=${familyId}&memberAId=${memberAId}&memberBId=${memberBId}`
      );
      return response;
    } catch (error: any) {
      // Handle API errors
      throw new Error(error.response?.data?.message || error.message || 'An unexpected error occurred during relationship detection.');
    }
  }
}
