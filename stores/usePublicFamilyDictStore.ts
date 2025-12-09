import { create } from 'zustand';
import { familyDictService as defaultFamilyDictService } from '@/services';
import type { FamilyDictDto, FamilyDictSearchQuery } from '@/types';
import { createGenericCrudStore, GenericCrudStore } from '@/stores/useGenericCrudStore';

const PAGE_SIZE = 10;

export type PublicFamilyDictStore = GenericCrudStore<FamilyDictDto, FamilyDictDto, FamilyDictSearchQuery>;

export const usePublicFamilyDictStore = create<PublicFamilyDictStore>(
  createGenericCrudStore<FamilyDictDto, FamilyDictDto, FamilyDictSearchQuery>(
    defaultFamilyDictService,
    PAGE_SIZE
  )
);