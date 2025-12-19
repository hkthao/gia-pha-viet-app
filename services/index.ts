// apps/mobile/family_tree_rn/services/index.ts

import { ApiUserProfileService, IUserProfileService } from './userProfile';
import { ApiFamilyService, IFamilyService } from './family';
import { ApiMemberService, IMemberService } from './member';
import { ApiEventService, IEventService } from './event';
import { ApiRelationshipService } from './relationship/api.relationship.service';
import { IRelationshipService } from './relationship/relationship.service.interface';
import { ApiFaceService, IFaceService } from './face';
import { ApiFamilyDictService, IFamilyDictService } from './familyDict';
import { ApiDashboardService, IDashboardService } from './dashboard';
import { ApiPrivacyService, IPrivacyService } from './privacy';
import { ApiUserService, IUserService } from './user';
import { ApiFamilyMediaService, IFamilyMediaService } from './familyMedia'; // New Media Service
import { ApiMemoryItemService, IMemoryItemService } from './memory'; // New Memory Item Service
import { apiClientWithAuth } from './api';
import { ApiFamilyLocationService, IFamilyLocationService } from './familyLocation';

// Initialize services
export const userProfileService: IUserProfileService = new ApiUserProfileService(apiClientWithAuth);
export const familyService: IFamilyService = new ApiFamilyService(apiClientWithAuth);
export const memberService: IMemberService = new ApiMemberService(apiClientWithAuth);
export const eventService: IEventService = new ApiEventService(apiClientWithAuth);
export const relationshipService: IRelationshipService = new ApiRelationshipService(apiClientWithAuth);
export const faceService: IFaceService = new ApiFaceService(apiClientWithAuth);
export const familyDictService: IFamilyDictService = new ApiFamilyDictService(apiClientWithAuth);
export const dashboardService: IDashboardService = new ApiDashboardService(apiClientWithAuth);
export const privacyService: IPrivacyService = new ApiPrivacyService(apiClientWithAuth);
export const userService: IUserService = new ApiUserService(apiClientWithAuth);
export const familyMediaService: IFamilyMediaService = new ApiFamilyMediaService(apiClientWithAuth); 
export const familyLocationService: IFamilyLocationService = new ApiFamilyLocationService(apiClientWithAuth); 
export const memoryItemService: IMemoryItemService = new ApiMemoryItemService(apiClientWithAuth); 

// Optionally re-export all types and classes from sub-modules for broader access if needed
export * from './userProfile';
export * from './family';
export * from './member';
export * from './event';
export * from './relationship';
export * from './face';
export * from './familyDict';
export * from './dashboard';
export * from './api';
export * from './privacy';
export * from './user';
export * from './familyMedia'; // Export new media service types
export * from './familyLocation';
export * from './memory';



