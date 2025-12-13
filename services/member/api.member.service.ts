// apps/mobile/family_tree_rn/services/member/api.member.service.ts

import { ApiClientMethods } from '@/types';
import { MemberListDto, SearchMembersQuery, MemberDetailDto, MemberCreateRequestDto, MemberUpdateRequestDto, Result as TResult } from '@/types';
import { Result } from '@/utils/resultUtils'; // Import Result as a value
import { IMemberService } from '@/services/member/member.service.interface';
import { GenericService } from '../base/abstract.generic.service'; // NEW IMPORT

export class ApiMemberService extends GenericService<MemberListDto, SearchMembersQuery, MemberDetailDto, MemberCreateRequestDto, MemberUpdateRequestDto> implements IMemberService {
  protected get baseEndpoint(): string {
    return '/member'; // Assuming /members is the base endpoint for member CRUD operations
  }

  constructor(apiClient: ApiClientMethods) {
    super(apiClient);
  }

  // The methods searchMembers, getMembersByFamilyId, getMemberById are now
  // either inherited from GenericService (search, getById)
  // or are implicitly removed if they don't fit the IGenericService contract (getMembersByFamilyId, getMemberById with familyId)
  // If getMembersByFamilyId is still specifically needed, IMemberService interface would need to be re-evaluated
}
