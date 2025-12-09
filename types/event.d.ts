// gia-pha-viet-app/src/types/event.d.ts

import { BaseAuditableDto, BaseSearchQuery } from './common';
import { MemberListDto } from './member';

export enum EventType {
  Birth = 0,
  Marriage = 1,
  Death = 2,
  Anniversary = 3,
  Other = 4
}

export interface EventDto extends BaseAuditableDto {
  id: string;
  familyId: string;
  name?: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  type: EventType;
  relatedMembers: MemberListDto[];
}

export interface GetEventsQuery {
  familyId?: string;
  startDate?: string;
  endDate?: string;
  type?: EventType;
  relatedMemberId?: string;
}

export interface SearchEventsQuery extends BaseSearchQuery  {
  familyId?: string;
  startDate?: string;
  endDate?: string;
  type?: EventType;
  relatedMemberId?: string;
}

export interface GetUpcomingEventsQuery {
  familyId?: string;
  startDate?: string;
  endDate?: string;
}
