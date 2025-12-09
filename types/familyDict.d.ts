// gia-pha-viet-app/src/types/familyDict.d.ts

import { BaseSearchQuery } from './common';

export enum FamilyDictType {
  Blood = 0,
  Marriage = 1,
  Adoption = 2,
  InLaw = 3,
  Other = 4,
}

export enum FamilyDictLineage {
  Noi = 0,
  Ngoai = 1,
  NoiNgoai = 2,
  Other = 3,
}

export interface NamesByRegionDto {
  north: string;
  central: string | string[];
  south: string | string[];
}

export interface FamilyDictDto {
  id: string;
  name: string;
  type: FamilyDictType;
  description: string;
  lineage: FamilyDictLineage;
  specialRelation: boolean;
  namesByRegion: NamesByRegionDto;
}

export interface FamilyDictSearchQuery extends BaseSearchQuery {
  lineage?: FamilyDictLineage;
  region?: string;
}
