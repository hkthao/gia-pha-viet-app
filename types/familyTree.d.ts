import { MemberListDto } from './member.d';
import { RelationshipListDto } from './relationship.d';

export interface WindowFamilyTreeData {
  familyId?: string;
  members?: MemberListDto[];
  relationships?: RelationshipListDto[];
}
