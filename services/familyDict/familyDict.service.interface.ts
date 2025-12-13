// apps/mobile/family_tree_rn/services/familyDict/familyDict.service.interface.ts

import { Result, FamilyDictDto, FamilyDictSearchQuery } from '@/types';
import { IGenericService } from '../base/generic.service.interface';

export interface IFamilyDictService extends IGenericService<FamilyDictDto, FamilyDictSearchQuery, FamilyDictDto, FamilyDictDto, FamilyDictDto> {
}
