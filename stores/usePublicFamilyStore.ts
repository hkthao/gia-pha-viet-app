import { create } from 'zustand';
// apps/mobile/family_tree_rn/stores/usePublicFamilyStore.ts

import { createGenericCrudStore, GenericCrudStore } from '@/stores/useGenericCrudStore';

import { IFamilyService } from '@/services';

import { familyService as defaultFamilyService } from '@/services';

import type { FamilyListDto, FamilyDetailDto, SearchPublicFamiliesQuery } from '@/types';



const PAGE_SIZE = 10;



export type PublicFamilyStore = GenericCrudStore<FamilyListDto, FamilyDetailDto, SearchPublicFamiliesQuery>;



export const usePublicFamilyStore = create<PublicFamilyStore>(

  createGenericCrudStore<FamilyListDto, FamilyDetailDto, SearchPublicFamiliesQuery>(

    defaultFamilyService,

    PAGE_SIZE

  )

);