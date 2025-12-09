// apps/mobile/family_tree_rn/services/event/event.service.interface.ts

import { Result } from '@/types';
import { EventDto, PaginatedList, SearchEventsQuery, GetUpcomingEventsQuery } from '@/types';
import { IGenericService } from '@/services/base/generic.service.interface';

export interface IEventService extends IGenericService<EventDto, SearchEventsQuery, EventDto> {
  getUpcomingEvents(query: GetUpcomingEventsQuery): Promise<Result<EventDto[]>>;
}
