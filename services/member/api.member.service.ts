// apps/mobile/family_tree_rn/services/member/api.member.service.ts

import { MemberListDto, SearchMembersQuery, MemberDetailDto, MemberCreateRequestDto, MemberUpdateRequestDto, Result } from '@/types';
import { IMemberService } from '@/services/member/member.service.interface';
import { GenericService } from '../base/abstract.generic.service';
import { parseError } from '@/utils/errorUtils'; // Import parseError
import { ResultHelper } from '@/utils/resultUtils'; // Import ResultHelper

export class ApiMemberService extends GenericService<MemberListDto, SearchMembersQuery, MemberDetailDto, MemberCreateRequestDto, MemberUpdateRequestDto> implements IMemberService {
  protected get baseEndpoint(): string {
    return '/member'; // Assuming /members is the base endpoint for member CRUD operations
  }

  async getMembersByFamilyId(familyId: string): Promise<Result<MemberListDto[]>> {
    try {
      const response = await this.apiClient.get<MemberListDto[]>(`${this.baseEndpoint}/by-family/${familyId}`);
      return ResultHelper.success(response);
    } catch (error: any) {
      return ResultHelper.fail(parseError(error));
    }
  }
}
