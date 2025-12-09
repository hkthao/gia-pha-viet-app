// apps/mobile/family_tree_rn/services/event/api.event.service.ts

import { ApiClientMethods } from '@/types';
import { Result, ApiError, EventDto, PaginatedList, SearchEventsQuery, GetUpcomingEventsQuery } from '@/types';
import { IEventService } from '@/services/event/event.service.interface';

export class ApiEventService implements IEventService {
  constructor(private api: ApiClientMethods) {}

  async getEventById(id: string): Promise<Result<EventDto>> {
    try {
      const response = await this.api.get<EventDto>(`/event/${id}`);
      return { isSuccess: true, value: response };
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
        statusCode: error.response?.status,
      };
      return { isSuccess: false, error: apiError };
    }
  }

  async searchEvents(query: SearchEventsQuery): Promise<Result<PaginatedList<EventDto>>> {
    try {
      const response = await this.api.get<PaginatedList<EventDto>>('/events/search', {
        params: query,
      });
      return { isSuccess: true, value: response };
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
        statusCode: error.response?.status,
      };
      return { isSuccess: false, error: apiError };
    }
  }

  async getUpcomingEvents(query: GetUpcomingEventsQuery): Promise<Result<EventDto[]>> {
    try {
      const response = await this.api.get<EventDto[]>(`/events/upcoming`, { params: query });
      return { isSuccess: true, value: response };
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
        statusCode: error.response?.status,
      };
      return { isSuccess: false, error: apiError };
    }
  }
}
