import {
  FamilyLocationDto,
  CreateFamilyLocationRequestDto,
  UpdateFamilyLocationRequestDto,
  SearchFamilyLocationsQuery, // Corrected import for ApiClientMethods
} from '@/types';
import { GenericService } from '../base/abstract.generic.service';
import { IFamilyLocationService } from './familyLocation.service.interface';
import { apiClientWithAuth } from '../api/publicApiClient'; // Correct import for apiClientWithAuth

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

export const familyLocationService: IFamilyLocationService = new ApiFamilyLocationService(apiClientWithAuth);