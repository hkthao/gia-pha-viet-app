// apps/mobile/family_tree_rn/services/event/event.service.interface.ts

import { Result } from '@/types';
import { EventDto, PaginatedList, SearchEventsQuery, GetUpcomingEventsQuery } from '@/types';

export interface IEventService {
  getEventById(id: string): Promise<Result<EventDto>>;
  searchEvents(query: SearchEventsQuery): Promise<Result<PaginatedList<EventDto>>>;
  getUpcomingEvents(query: GetUpcomingEventsQuery): Promise<Result<EventDto[]>>;
}
