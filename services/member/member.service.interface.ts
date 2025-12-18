// apps/mobile/family_tree_rn/services/member/member.service.interface.ts

import { MemberListDto, SearchMembersQuery, MemberDetailDto, MemberCreateRequestDto, MemberUpdateRequestDto } from '@/types';
import { IGenericService } from '../base/generic.service.interface';

export interface IMemberService extends IGenericService<MemberListDto, SearchMembersQuery, MemberDetailDto, MemberCreateRequestDto, MemberUpdateRequestDto> {
}
