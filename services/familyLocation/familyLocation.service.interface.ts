import { IGenericService } from '../base/generic.service.interface';
import { FamilyLocationDto, CreateFamilyLocationRequestDto, UpdateFamilyLocationRequestDto, SearchFamilyLocationsQuery } from '@/types';

export interface IFamilyLocationService extends IGenericService<
  FamilyLocationDto,
  SearchFamilyLocationsQuery,
  FamilyLocationDto,
  CreateFamilyLocationRequestDto,
  UpdateFamilyLocationRequestDto
> {
  // Add any FamilyLocation-specific service methods here if they don't fit the generic CRUD pattern.
  // For now, the generic methods are sufficient.
}
