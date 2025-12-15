// apps/mobile/family_tree_rn/services/event/api.event.service.ts

import { ApiClientMethods } from '@/types';
import { Result, ApiError, EventDto, PaginatedList, SearchEventsQuery, GetUpcomingEventsQuery, CreateEventRequestDto, UpdateEventRequestDto } from '@/types';
import { IEventService } from '@/services/event/event.service.interface';

export class ApiEventService implements IEventService {
  constructor(private api: ApiClientMethods) {}

  async getById(id: string): Promise<Result<EventDto>> {
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

  async search(query: SearchEventsQuery): Promise<Result<PaginatedList<EventDto>>> {
    try {
      const response = await this.api.get<PaginatedList<EventDto>>('/event/search', {
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

  async create(entity: CreateEventRequestDto): Promise<Result<EventDto>> {
    try {
      const response = await this.api.post<EventDto>('/event', entity);
      return { isSuccess: true, value: response };
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
        statusCode: error.response?.status,
      };
      return { isSuccess: false, error: apiError };
    }
  }

  async update(id: string, entity: UpdateEventRequestDto): Promise<Result<EventDto>> {
    try {
      const response = await this.api.put<EventDto>(`/event/${id}`, entity);
      return { isSuccess: true, value: response };
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
        statusCode: error.response?.status,
      };
      return { isSuccess: false, error: apiError };
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.api.delete(`/event/${id}`);
      return { isSuccess: true, value: undefined };
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
      const response = await this.api.get<EventDto[]>(`/event/upcoming`, { params: query });
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
