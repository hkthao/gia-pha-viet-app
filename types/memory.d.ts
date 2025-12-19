// gia-pha-viet-app/types/memory.d.ts

import { BaseAuditableDto, BaseSearchQuery } from './common';

export enum EmotionalTag {
  Happy = 0,
  Sad = 1,
  Proud = 2,
  Memorial = 3,
  Neutral = 4,
}

export interface MemoryMediaDto {
  id?: string; // Optional for creation, present for update/view
  url?: string;
}

export interface MemoryPersonDto {
  memberId: string;
  memberName?: string;
  memberAvatarUrl?: string;
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
  happenedAt?: string;
  emotionalTag: EmotionalTag;
  memoryMedia: MemoryMediaDto[];
  personIds: string[];
  deletedMediaIds: string[];
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
