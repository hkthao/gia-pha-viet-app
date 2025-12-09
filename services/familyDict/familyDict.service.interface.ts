// apps/mobile/family_tree_rn/services/familyDict/familyDict.service.interface.ts

import { Result, FamilyDictDto, FamilyDictFilter } from '@/types';
import { IGenericService } from '../base/generic.service.interface';

export interface IFamilyDictService extends IGenericService<FamilyDictDto, FamilyDictFilter, FamilyDictDto> {
}
