// apps/mobile/family_tree_rn/stores/usePublicMemberStore.ts

import { create, StateCreator } from 'zustand';
import { memberService as defaultMemberService } from '@/services';
import { IMemberService } from '@/services';
import type { MemberListDto, SearchPublicMembersQuery, MemberDetailDto } from '@/types';
import { createGenericCrudStore, GenericCrudStore } from './useGenericCrudStore';

const PAGE_SIZE = 10; // Define PAGE_SIZE constant

export type PublicMemberStore = GenericCrudStore<MemberListDto, MemberDetailDto, SearchPublicMembersQuery>;

// Factory function to create the store
export const createPublicMemberStore = (
  memberService: IMemberService
): StateCreator<PublicMemberStore> => (
  createGenericCrudStore<MemberListDto, MemberDetailDto, SearchPublicMembersQuery>(
    memberService,
    PAGE_SIZE
  )
);

// Export default store instance
export const usePublicMemberStore = create<PublicMemberStore>(createPublicMemberStore(defaultMemberService));
