// gia-pha-viet-app/src/types/event.d.ts

import { BaseAuditableDto, BaseSearchQuery } from './common';
import { MemberListDto } from './member';
import { EventFormCalendarType, EventFormRepeatRule } from '@/utils/validation/eventValidationSchema';

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
  name: string; // Changed to required
  description?: string;
  startDate: string; // This is the solar date
  endDate?: string;
  location?: string;
  type: EventType;
  relatedMembers: MemberListDto[];
  // Additional fields from the form that might be stored on the backend but not in the original EventDto
  code: string; // Made required
  color?: string;
  calendarType: EventFormCalendarType; // Made required
  lunarDay?: number;
  lunarMonth?: number;
  isLeapMonth?: boolean;
  repeatRule: EventFormRepeatRule; // Made required
}

export interface CreateEventRequestDto {
  familyId: string;
  name: string;
  code?: string;
  color?: string;
  description?: string;
  solarDate?: string; // ISO string format
  location?: string;
  type: EventType;
  repeatRule: EventFormRepeatRule;
  calendarType: EventFormCalendarType;
  lunarDay?: number;
  lunarMonth?: number;
  isLeapMonth?: boolean;
}

export interface UpdateEventRequestDto extends Partial<CreateEventRequestDto> {
  id: string;
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
