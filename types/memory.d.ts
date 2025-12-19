// gia-pha-viet-app/types/memory.d.ts

import { BaseAuditableDto, BaseSearchQuery } from './common';

export enum EmotionalTag {
  Neutral = 0,
  Happy = 1,
  Sad = 2,
  Angry = 3,
  Surprise = 4,
  Love = 5,
}

export interface MemoryMediaDto {
  id?: string; // Optional for creation, present for update/view
  url: string;
}

export interface MemoryPersonDto {
  memberId: string;
  memberName: string;
}

export interface MemoryItemDto extends BaseAuditableDto {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  happenedAt: string; // ISO 8601 string
  emotionalTag: EmotionalTag;
  memoryMedia: MemoryMediaDto[];
  memoryPersons: MemoryPersonDto[];
}

export interface MemoryItemCreateRequestDto {
  familyId: string;
  title: string;
  description?: string;
  happenedAt: string;
  emotionalTag: EmotionalTag;
  memoryMedia?: MemoryMediaDto[]; // Media might be uploaded separately or as part of creation
  memoryPersons?: MemoryPersonDto[];
}

export interface MemoryItemUpdateRequestDto {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  happenedAt: string;
  emotionalTag: EmotionalTag;
  memoryMedia?: MemoryMediaDto[];
  memoryPersons?: MemoryPersonDto[];
}

export interface SearchMemoryItemsQuery extends BaseSearchQuery {
  familyId?: string;
}
