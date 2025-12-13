// apps/mobile/family_tree_rn/services/family/family.service.interface.ts

import { FamilyListDto, SearchFamiliesQuery, FamilyDetailDto, PaginatedList, Result, FamilyCreateRequestDto, FamilyUpdateRequestDto } from '@/types';
import { IGenericService } from '../base/generic.service.interface'; // Vẫn giữ import nếu muốn tham chiếu

// IFamilyService sẽ quản lý FamilyListDto cho các hoạt động tìm kiếm/liệt kê
// và FamilyDetailDto cho hoạt động getById cũng như các hoạt động CRUD chi tiết.
import { FamilyUserDto } from '@/types/family'; // Import FamilyUserDto

export interface IFamilyService {
  search(filter: SearchFamiliesQuery): Promise<Result<PaginatedList<FamilyListDto>>>;
  getById(id: string): Promise<Result<FamilyDetailDto>>;
  create(entity: FamilyCreateRequestDto): Promise<Result<FamilyDetailDto>>;
  update(id: string, entity: FamilyUpdateRequestDto): Promise<Result<FamilyDetailDto>>;
  delete(id: string): Promise<Result<void>>;
  getMyAccess(): Promise<Result<FamilyUserDto[]>>; // New method from permissionService
}
