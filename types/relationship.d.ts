// gia-pha-viet-app/src/types/relationship.d.ts

export enum RelationshipType {
  Father = "Father",
  Mother = "Mother",
  Husband = "Husband",
  Wife = "Wife",
}

export interface RelationshipMemberDto {
  id: string;
  fullName?: string;
  isRoot: boolean;
  avatarUrl?: string;
  dateOfBirth?: string;
}

export interface RelationshipDto {
  id: string;
  sourceMemberId: string;
  sourceMember?: RelationshipMemberDto;
  targetMemberId: string;
  targetMember?: RelationshipMemberDto;
  type: RelationshipType;
  order?: number;
  familyId: string;
}

export interface RelationshipListDto {
  id: string;
  sourceMemberId: string;
  targetMemberId: string;
  type: RelationshipType;
  order?: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  sourceMember?: RelationshipMemberDto;
  targetMember?: RelationshipMemberDto;
}

export interface DetectRelationshipResult {
  description: string;
  edges: string[];
  path: string[];
}
