import {
  FamilyLocationDto,
  CreateFamilyLocationRequestDto,
  UpdateFamilyLocationRequestDto,
  SearchFamilyLocationsQuery, // Corrected import for ApiClientMethods
} from '@/types';
import { GenericService } from '../base/abstract.generic.service';
import { IFamilyLocationService } from './familyLocation.service.interface';

export class ApiFamilyLocationService extends GenericService<
  FamilyLocationDto, // TListDto
  SearchFamilyLocationsQuery, // TFilter
  FamilyLocationDto, // TDetailDto
  CreateFamilyLocationRequestDto, // TCreateDto
  UpdateFamilyLocationRequestDto // TUpdateDto
> implements IFamilyLocationService {
  protected get baseEndpoint(): string {
    return '/family-locations';
  }
}
