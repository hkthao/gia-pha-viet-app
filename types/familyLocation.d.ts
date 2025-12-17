// gia-pha-viet-app/types/familyLocation.d.ts

import { BaseAuditableDto, BaseSearchQuery } from './common';

export enum LocationType {
    Home = 0,
    Birthplace = 1,
    Deathplace = 2,
    Burial = 3,
    Other = 4
}

export enum LocationAccuracy {
    Exact = 0,
    Approximate = 1,
    Estimated = 2
}

export enum LocationSource {
    UserSelected = 0,
    Geocoded = 1
}

export interface FamilyLocationDto extends BaseAuditableDto {
    id: string;
    familyId: string;
    name: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    locationType: LocationType;
    accuracy: LocationAccuracy;
    source: LocationSource;
}

export interface CreateFamilyLocationRequestDto {
    familyId: string;
    name: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    locationType: LocationType;
    accuracy?: LocationAccuracy;
    source?: LocationSource;
}

export interface UpdateFamilyLocationRequestDto extends Partial<CreateFamilyLocationRequestDto> {
    id: string;
}

export interface SearchFamilyLocationsQuery extends BaseSearchQuery {
    familyId?: string;
    name?: string;
    locationType?: LocationType;
    accuracy?: LocationAccuracy;
    source?: LocationSource;
}
