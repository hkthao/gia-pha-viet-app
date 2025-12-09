// apps/mobile/family_tree_rn/services/familyDict/api.familyDict.service.ts

import { ApiClientMethods, FamilyDictDto, FamilyDictFilter } from '@/types';
import { IFamilyDictService } from '@/services/familyDict/familyDict.service.interface';
import { GenericService } from '../base/abstract.generic.service';

export class ApiFamilyDictService extends GenericService<FamilyDictDto, FamilyDictFilter, FamilyDictDto> implements IFamilyDictService {
  protected get baseEndpoint(): string {
    return '/family-dict';
  }

  constructor(apiClient: ApiClientMethods) {
    super(apiClient);
  }
}
