// gia-pha-viet-app/services/memory/memory.service.interface.ts

import { IGenericService } from '../base/generic.service.interface';
import { MemoryItemDto, SearchMemoryItemsQuery, MemoryItemCreateRequestDto, MemoryItemUpdateRequestDto } from '@/types';

export type IMemoryItemService = IGenericService<MemoryItemDto, SearchMemoryItemsQuery, MemoryItemDto, MemoryItemCreateRequestDto, MemoryItemUpdateRequestDto>
