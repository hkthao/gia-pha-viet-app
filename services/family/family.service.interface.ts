// apps/mobile/family_tree_rn/services/family/family.service.interface.ts

import { FamilyListDto, SearchFamiliesQuery, FamilyDetailDto, Result, FamilyCreateRequestDto, FamilyUpdateRequestDto } from '@/types';
import { IGenericService } from '../base/generic.service.interface';

// IFamilyService sẽ quản lý FamilyListDto cho các hoạt động tìm kiếm/liệt kê
// và FamilyDetailDto cho hoạt động getById cũng như các hoạt động CRUD chi tiết.
import { FamilyUserDto } from '@/types/family'; // Import FamilyUserDto

export interface IFamilyService extends IGenericService<FamilyListDto, SearchFamiliesQuery, FamilyDetailDto, FamilyCreateRequestDto, FamilyUpdateRequestDto> {
  getMyAccess(): Promise<Result<FamilyUserDto[]>>; // New method from permissionService
}
