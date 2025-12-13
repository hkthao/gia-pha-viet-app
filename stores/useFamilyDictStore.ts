import { create } from 'zustand';
import { familyDictService as defaultFamilyDictService } from '@/services';
import type { FamilyDictDto, FamilyDictSearchQuery } from '@/types';
import { createGenericCrudStore, GenericCrudStore } from '@/stores/useGenericCrudStore';

const PAGE_SIZE = 10;

export type FamilyDictStore = GenericCrudStore<FamilyDictDto, FamilyDictDto, FamilyDictSearchQuery, FamilyDictDto, FamilyDictDto>;

export const useFamilyDictStore = create<FamilyDictStore>(
  createGenericCrudStore<FamilyDictDto, FamilyDictDto, FamilyDictSearchQuery, FamilyDictDto, FamilyDictDto>(
    defaultFamilyDictService,
    PAGE_SIZE
  )
);