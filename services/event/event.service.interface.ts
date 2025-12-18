// apps/mobile/family_tree_rn/services/event/event.service.interface.ts

import { Result , EventDto, SearchEventsQuery, GetUpcomingEventsQuery, CreateEventRequestDto, UpdateEventRequestDto } from '@/types';
import { IGenericService } from '@/services/base/generic.service.interface';

export interface IEventService extends IGenericService<EventDto, SearchEventsQuery, EventDto, CreateEventRequestDto, UpdateEventRequestDto> {
  getUpcomingEvents(query: GetUpcomingEventsQuery): Promise<Result<EventDto[]>>;
}
