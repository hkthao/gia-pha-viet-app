// apps/mobile/family_tree_rn/stores/useMemberStore.ts

import { create, StateCreator } from 'zustand';
import { memberService as defaultMemberService } from '@/services';
import { IMemberService } from '@/services';
import type { MemberListDto, SearchMembersQuery, MemberDetailDto } from '@/types';
import { createGenericCrudStore, GenericCrudStore } from './useGenericCrudStore';

const PAGE_SIZE = 10; // Define PAGE_SIZE constant

export type MemberStore = GenericCrudStore<MemberListDto, MemberDetailDto, SearchMembersQuery>;

// Factory function to create the store
export const createMemberStore = (
  memberService: IMemberService
): StateCreator<MemberStore> => (
  createGenericCrudStore<MemberListDto, MemberDetailDto, SearchMembersQuery>(
    memberService,
    PAGE_SIZE
  )
);

// Export default store instance
export const useMemberStore = create<MemberStore>(createMemberStore(defaultMemberService));
