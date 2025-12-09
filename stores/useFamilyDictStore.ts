import { create } from 'zustand';
import { familyDictService as defaultFamilyDictService } from '@/services';
import type { FamilyDictDto, FamilyDictSearchQuery } from '@/types';
import { createGenericCrudStore, GenericCrudStore } from '@/stores/useGenericCrudStore';

const PAGE_SIZE = 10;

export type FamilyDictStore = GenericCrudStore<FamilyDictDto, FamilyDictDto, FamilyDictSearchQuery>;

export const useFamilyDictStore = create<FamilyDictStore>(
  createGenericCrudStore<FamilyDictDto, FamilyDictDto, FamilyDictSearchQuery>(
    defaultFamilyDictService,
    PAGE_SIZE
  )
);