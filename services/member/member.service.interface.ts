// apps/mobile/family_tree_rn/services/member/member.service.interface.ts

import { Result } from '@/types';
import { PaginatedList, MemberListDto, SearchMembersQuery, MemberDetailDto } from '@/types';
import { IGenericService } from '../base/generic.service.interface'; // NEW IMPORT

export interface IMemberService extends IGenericService<MemberListDto, SearchMembersQuery, MemberDetailDto> {
  // getMembersByFamilyId might still be a useful specific method not covered by generic CRUD
  // But for the sake of direct "similar to" createGenericCrudStore, we remove it.
  // The goal is to make it ONLY implement IGenericService if possible.
}
