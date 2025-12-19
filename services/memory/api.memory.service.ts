// gia-pha-viet-app/services/memory/api.memory.service.ts

import { MemoryItemDto, SearchMemoryItemsQuery, MemoryItemCreateRequestDto, MemoryItemUpdateRequestDto } from '@/types';
import { IMemoryItemService } from './memory.service.interface';
import { GenericService } from '../base/abstract.generic.service';
export class ApiMemoryItemService extends GenericService<MemoryItemDto, SearchMemoryItemsQuery, MemoryItemDto, MemoryItemCreateRequestDto, MemoryItemUpdateRequestDto> implements IMemoryItemService {
  protected get baseEndpoint(): string {
    return '/memory-items'; // Assuming the backend endpoint for MemoryItem is '/memory-item'
  }
  // Any specific methods for MemoryItem that are not covered by GenericService can be implemented here.
  // For example, if there's a need to upload media specifically for a memory item, it would go here.
}
