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

export enum CalendarType {
  SOLAR = 1,
  LUNAR = 2,
}

export enum RepeatRule {
  YEARLY = 1,
  NONE = 0,
}

export interface LunarDateDto {
  day?: int;
  month?: int;
  isLeapMonth?: boolean;
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
  code: string; // Made required
  color?: string;
  calendarType: CalendarType; // Made required
  lunarDate?: LunarDateDto;
  repeatRule: RepeatRule; // Made required
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
  repeatRule: RepeatRule;
  calendarType: CalendarType;
  lunarDate?: LunarDateDto;
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

export interface SearchEventsQuery extends BaseSearchQuery {
  familyId?: string;
  startDate?: string;
  endDate?: string;
  type?: EventType;
  relatedMemberId?: string;
  lunarStartDay?: number;
  lunarStartMonth?: number;
  lunarEndDay?: number;
  lunarEndMonth?: number;
}

export interface GetUpcomingEventsQuery {
  familyId?: string;
  startDate?: string;
  endDate?: string;
}
