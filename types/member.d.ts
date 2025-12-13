// gia-pha-viet-app/src/types/member.d.ts

import { BaseAuditableDto, BaseSearchQuery } from './common';
import { RelationshipDto, RelationshipMemberDto } from './relationship'; // PROPER IMPORT


export enum Gender {
  Male = "Male",
  Female = "Female",
  Other = "Other",
}

export interface SearchMembersQuery extends BaseSearchQuery {
  familyId: string;
  gender?: Gender;
  isRoot?: boolean;
}

export interface MemberListDto extends BaseAuditableDto {
  id: string;
  lastName: string;
  firstName: string;
  fullName: string;
  code: string;
  avatarUrl?: string;
  familyId: string;
  familyName?: string;
  isRoot: boolean;
  dateOfBirth?: string;
  dateOfDeath?: string;
  gender?: Gender;
  occupation?: string;
  fatherFullName?: string;
  fatherAvatarUrl?: string;
  motherFullName?: string;
  motherAvatarUrl?: string;
  husbandFullName?: string;
  husbandAvatarUrl?: string;
  wifeFullName?: string;
  wifeAvatarUrl?: string;
  fatherId?: string;
  motherId?: string;
  husbandId?: string;
  wifeId?: string;
  fatherGender?: Gender;
  motherGender?: Gender;
  husbandGender?: Gender;
  wifeGender?: Gender;
  birthDeathYears?: string;
}

export interface MemberDetailDto extends BaseAuditableDto {
  id: string;
  lastName: string;
  firstName: string;
  fullName: string;
  nickname?: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  placeOfBirth?: string;
  placeOfDeath?: string;
  gender?: Gender;
  avatarUrl?: string;
  occupation?: string;
  email?: string;
  phone?: string;
  address?: string;
  familyId: string;
  biography?: string;
  isRoot: boolean;
  birthDeathYears?: string;
  fatherFullName?: string;
  motherFullName?: string;
  husbandFullName?: string;
  wifeFullName?: string;
  fatherId?: string;
  motherId?: string;
  husbandId?: string;
  wifeId?: string;
  sourceRelationships: RelationshipDto[];
  targetRelationships: RelationshipDto[];
  order?: number;
  isDeceased?: boolean;
}
