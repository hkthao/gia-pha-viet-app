// services/abstract.generic.service.ts

import { PaginatedList, Result } from '@/types';
import { parseError } from '@/utils/errorUtils';
import { IGenericService } from './generic.service.interface';
import { ResultHelper } from '@/utils/resultUtils';
import { ApiClientMethods } from '@/types/apiClient'; // Import ApiClient interface

/**
 * @abstract
 * @class GenericService
 * @description Lớp trừu tượng cung cấp triển khai cơ bản cho các hoạt động CRUD
 *              cho một tài nguyên API cụ thể.
 * @template TListDto - Kiểu của đối tượng được quản lý trong danh sách.
 * @template TFilter - Kiểu của đối tượng lọc dùng cho việc tìm kiếm và phân trang.
 * @template TEntity - Kiểu của đối tượng chi tiết được quản lý.
 */
export abstract class GenericService<TListDto, TFilter extends { page?: number; itemsPerPage?: number }, TEntity> implements IGenericService<TListDto, TFilter, TEntity> {
  protected readonly apiClient: ApiClientMethods;

  /**
   * @protected
   * @abstract
   * @property baseEndpoint
   * @description Endpoint cơ sở cho tài nguyên API cụ thể (ví dụ: 'family-dicts').
   */
  protected abstract get baseEndpoint(): string;

  constructor(apiClient: ApiClientMethods) {
    this.apiClient = apiClient;
  }

  /**
   * @method search
   * @description Tìm kiếm và trả về danh sách đối tượng có phân trang.
   * @param filter - Đối tượng lọc chứa các tiêu chí tìm kiếm và thông tin phân trang.
   * @returns Promise<Result<PaginatedList<T>>>
   */
  async search(filter: TFilter): Promise<Result<PaginatedList<TListDto>>> {
    try {
      const response = await this.apiClient.get<PaginatedList<TListDto>>(`${this.baseEndpoint}/search`, {
        params: filter,
      });
      return ResultHelper.success(response);
    } catch (error: any) {
      return ResultHelper.fail(parseError(error));
    }
  }

  /**
   * @method getById
   * @description Lấy một đối tượng dựa trên ID của nó.
   * @param id - ID của đối tượng.
   * @returns Promise<Result<T>>
   */
  async getById(id: string): Promise<Result<TEntity>> {
    try {
      const response = await this.apiClient.get<TEntity>(`${this.baseEndpoint}/${id}`);
      return ResultHelper.success(response);
    } catch (error: any) {
      return ResultHelper.fail(parseError(error));
    }
  }

  /**
   * @method create
   * @description Tạo một đối tượng mới.
   * @param entity - Đối tượng cần tạo.
   * @returns Promise<Result<T>>
   */
  async create(entity: Partial<TEntity>): Promise<Result<TEntity>> {
    try {
      const response = await this.apiClient.post<TEntity>(this.baseEndpoint, entity);
      return ResultHelper.success(response);
    } catch (error: any) {
      return ResultHelper.fail(parseError(error));
    }
  }

  /**
   * @method update
   * @description Cập nhật một đối tượng hiện có.
   * @param id - ID của đối tượng.
   * @param entity - Đối tượng với các thông tin cập nhật.
   * @returns Promise<Result<T>>
   */
  async update(id: string, entity: Partial<TEntity>): Promise<Result<TEntity>> {
    try {
      const response = await this.apiClient.put<TEntity>(`${this.baseEndpoint}/${id}`, entity);
      return ResultHelper.success(response);
    } catch (error: any) {
      return ResultHelper.fail(parseError(error));
    }
  }

  /**
   * @method delete
   * @description Xóa một đối tượng dựa trên ID của nó.
   * @param id - ID của đối tượng.
   * @returns Promise<Result<void>>
   */
  async delete(id: string): Promise<Result<void>> {
    try {
      await this.apiClient.delete(`${this.baseEndpoint}/${id}`);
      return ResultHelper.success(undefined);
    } catch (error: any) {
      return ResultHelper.fail(parseError(error));
    }
  }
}
