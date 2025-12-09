// services/face/face.service.interface.ts

import { Result, PaginatedList } from '@/types';
import { DetectedFaceDto, SearchFacesQuery, FaceDetectionResponseDto } from '@/types';
import { IGenericService } from '@/services/base/generic.service.interface';

export interface DetectFacesRequest {
  fileUri: string;
  fileName: string;
  fileType: string;
  familyId: string;
  returnCrop: boolean;
}

export interface IFaceService extends IGenericService<DetectedFaceDto, SearchFacesQuery, DetectedFaceDto> {
  detectFaces(request: DetectFacesRequest): Promise<Result<FaceDetectionResponseDto>>;
}