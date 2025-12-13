import { create } from 'zustand';
// apps/mobile/family_tree_rn/stores/useFamilyStore.ts
import { createGenericCrudStore, GenericCrudStore } from '@/stores/useGenericCrudStore';
import { familyService as defaultFamilyService } from '@/services';
import type { FamilyListDto, FamilyDetailDto, SearchFamiliesQuery, FamilyCreateRequestDto, FamilyUpdateRequestDto } from '@/types';
const PAGE_SIZE = 10;
export type FamilyListStore = GenericCrudStore<FamilyListDto, FamilyDetailDto, SearchFamiliesQuery, FamilyCreateRequestDto, FamilyUpdateRequestDto>;
export const useFamilyListStore = create<FamilyListStore>(
  createGenericCrudStore<FamilyListDto, FamilyDetailDto, SearchFamiliesQuery, FamilyCreateRequestDto, FamilyUpdateRequestDto>(
    defaultFamilyService,
    PAGE_SIZE
  )
);