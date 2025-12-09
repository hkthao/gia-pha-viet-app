// services/generic.service.interface.ts

import { Result, PaginatedList } from '@/types';

/**
 * @interface IGenericService
 * @description Giao diện chung cho các dịch vụ CRUD.
 * @template TListDto - Kiểu của đối tượng (entity) được quản lý trong danh sách.
 * @template TFilter - Kiểu của đối tượng lọc dùng cho việc tìm kiếm và phân trang.
 * @template TEntity - Kiểu của đối tượng chi tiết (entity) được quản lý.
 */
export interface IGenericService<TListDto, TFilter, TEntity> {
  /**
   * @method search
   * @description Tìm kiếm và trả về danh sách đối tượng có phân trang dựa trên bộ lọc.
   * @param filter - Đối tượng lọc chứa các tiêu chí tìm kiếm và thông tin phân trang.
   * @returns Promise<Result<PaginatedList<TListDto>>> - Kết quả trả về là một PaginatedList của các đối tượng TListDto hoặc lỗi.
   */
  search(filter: TFilter): Promise<Result<PaginatedList<TListDto>>>;

  /**
   * @method getById
   * @description Lấy một đối tượng dựa trên ID của nó.
   * @param id - ID của đối tượng cần lấy.
   * @returns Promise<Result<TEntity>> - Kết quả trả về là đối tượng TEntity hoặc lỗi.
   */
  getById(id: string): Promise<Result<TEntity>>;

  /**
   * @method create
   * @description Tạo một đối tượng mới.
   * @param entity - Đối tượng cần tạo.
   * @returns Promise<Result<TEntity>> - Kết quả trả về là đối tượng TEntity đã được tạo hoặc lỗi.
   */
  create(entity: Partial<TEntity>): Promise<Result<TEntity>>;

  /**
   * @method update
   * @description Cập nhật một đối tượng hiện có.
   * @param id - ID của đối tượng cần cập nhật.
   * @param entity - Đối tượng với các thông tin cập nhật.
   * @returns Promise<Result<TEntity>> - Kết quả trả về là đối tượng TEntity đã được cập nhật hoặc lỗi.
   */
  update(id: string, entity: Partial<TEntity>): Promise<Result<TEntity>>;

  /**
   * @method delete
   * @description Xóa một đối tượng dựa trên ID của nó.
   * @param id - ID của đối tượng cần xóa.
   * @returns Promise<Result<void>> - Kết quả trả về là void nếu thành công hoặc lỗi.
   */
  delete(id: string): Promise<Result<void>>;
}
