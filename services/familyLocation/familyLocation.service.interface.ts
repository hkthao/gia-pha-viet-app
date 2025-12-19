import { IGenericService } from '../base/generic.service.interface';
import { FamilyLocationDto, CreateFamilyLocationRequestDto, UpdateFamilyLocationRequestDto, SearchFamilyLocationsQuery } from '@/types';

export type IFamilyLocationService = IGenericService<
  FamilyLocationDto,
  SearchFamilyLocationsQuery,
  FamilyLocationDto,
  CreateFamilyLocationRequestDto,
  UpdateFamilyLocationRequestDto
>
