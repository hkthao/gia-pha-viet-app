import { create, StateCreator } from 'zustand';
import { IGenericService } from '@/services/base/generic.service.interface';
import { Result, PaginatedList } from '@/types';
import { parseError } from '@/utils/errorUtils';

// Định nghĩa trạng thái chung cho một CRUD store
interface CrudState<TListDto, TDetailDto, TFilter> {
  item: TDetailDto | null;
  items: TListDto[];
  paginatedList: PaginatedList<TListDto> | null;
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
  filter: TFilter | null;
}

// Định nghĩa các hành động chung cho một CRUD store
interface CrudActions<TListDto, TDetailDto, TFilter> {
  // Hành động tìm kiếm và phân trang
  search: (filter: TFilter, isRefreshing?: boolean) => Promise<PaginatedList<TListDto> | null>;
  // Hành động lấy một đối tượng theo ID
  getById: (id: string) => Promise<TDetailDto | null>;
  // Hành động tạo mới một đối tượng
  create: (item: Partial<TDetailDto>) => Promise<TDetailDto | null>;
  // Hành động cập nhật một đối tượng hiện có
  update: (id: string, item: Partial<TDetailDto>) => Promise<TDetailDto | null>;
  // Hành động xóa một đối tượng
  delete: (id: string) => Promise<boolean>;
  // Xóa đối tượng hiện tại được chọn (nếu có)
  clearItem: () => void;
  // Đặt lại trạng thái của store
  reset: () => void;
  // Đặt lỗi thủ công
  setError: (error: string | null) => void;
  // Cập nhật bộ lọc
  setFilter: (filter: TFilter) => void;
}

export type GenericCrudStore<TListDto, TDetailDto, TFilter> = CrudState<TListDto, TDetailDto, TFilter> & CrudActions<TListDto, TDetailDto, TFilter>;

// Hàm factory để tạo generic CRUD store
export const createGenericCrudStore = <TListDto, TDetailDto, TFilter>(
  service: IGenericService<TListDto, TFilter, TDetailDto>,
  pageSize: number = 10
): StateCreator<GenericCrudStore<TListDto, TDetailDto, TFilter>> => (set, get) => ({
  item: null,
  items: [],
  paginatedList: null,
  loading: false,
  error: null,
  page: 1,
  totalPages: 0,
  totalItems: 0,
  hasMore: false,
  filter: null,

  search: async (filter: TFilter, isRefreshing: boolean = false): Promise<PaginatedList<TListDto> | null> => {
    set({ loading: true, error: null });
    try {
      const currentPage = isRefreshing ? 1 : ((filter as any).page ?? 1);
      const effectiveFilter = { ...filter, page: currentPage, itemsPerPage: pageSize };
      const result: Result<PaginatedList<TListDto>> = await service.search(effectiveFilter);

      if (result.isSuccess && result.value) {
        const paginatedList = result.value;
        set((state) => ({
          items: isRefreshing ? paginatedList.items : [...state.items, ...paginatedList.items],
          paginatedList: paginatedList,
          page: paginatedList.page,
          totalPages: paginatedList.totalPages,
          totalItems: paginatedList.totalItems,
          hasMore: paginatedList.totalPages > paginatedList.page,
        }));
        return paginatedList;
      } else {
        const errorMessage = parseError(result.error);
        set({ error: errorMessage });
        return null;
      }
    } catch (err: any) {
      const errorMessage = parseError(err);
      set({ error: errorMessage });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  getById: async (id: string): Promise<TDetailDto | null> => {
    set({ loading: true, error: null });
    try {
      const result: Result<TDetailDto> = await service.getById(id);
      if (result.isSuccess && result.value) {
        set({ item: result.value });
        return result.value;
      } else {
        const errorMessage = parseError(result.error);
        set({ error: errorMessage });
        return null;
      }
    } catch (err: any) {
      const errorMessage = parseError(err);
      set({ error: errorMessage });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  create: async (item: Partial<TDetailDto>): Promise<TDetailDto | null> => {
    set({ loading: true, error: null });
    try {
      const result: Result<TDetailDto> = await service.create(item);
      if (result.isSuccess && result.value) {
        set({ item: result.value });
        // Optionally refresh the list after creation
        // if (get().filter) {
        //   await get().search(get().filter, true);
        // }
        return result.value;
      } else {
        const errorMessage = parseError(result.error);
        set({ error: errorMessage });
        return null;
      }
    } catch (err: any) {
      const errorMessage = parseError(err);
      set({ error: errorMessage });
      return null;
    } finally {
      set({ loading: false });
    }
  },

    update: async (id: string, item: Partial<TDetailDto>): Promise<TDetailDto | null> => {
      set({ loading: true, error: null });
      try {
        const result: Result<TDetailDto> = await service.update(id, item);
        if (result.isSuccess && result.value) {
          set({ item: result.value });
          // Optionally refresh the list after update
          // if (get().filter) {
          //   await get().search(get().filter, true);
          // }
          return result.value;
        } else {
          const errorMessage = parseError(result.error);
          set({ error: errorMessage });
          return null;
        }
      } catch (err: any) {
        const errorMessage = parseError(err);
        set({ error: errorMessage });
        return null;
      } finally {
        set({ loading: false });
      }
    },
  delete: async (id: string): Promise<boolean> => {
    set({ loading: true, error: null });
    try {
      const result: Result<void> = await service.delete(id);
      if (result.isSuccess) {
        // Optionally refresh the list after deletion
        // if (get().filter) {
        //   await get().search(get().filter, true);
        // }
        return true;
      } else {
        const errorMessage = parseError(result.error);
        set({ error: errorMessage });
        return false;
      }
    } catch (err: any) {
      const errorMessage = parseError(err);
      set({ error: errorMessage });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  clearItem: () => set({ item: null }),

  reset: () =>
    set({
      item: null,
      items: [],
      paginatedList: null,
      loading: false,
      error: null,
      page: 1,
      totalPages: 0,
      totalItems: 0,
      hasMore: false,
      filter: null,
    }),

  setError: (error: string | null) => set({ error }),

  setFilter: (filter: TFilter) => set({ filter }),
});
