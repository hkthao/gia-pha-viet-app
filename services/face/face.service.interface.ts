// apps/mobile/family_tree_rn/services/face/face.service.interface.ts

import { Result } from '@/types';
import { FaceDetectionResponseDto } from '@/types';

// New interface to match the API requirements for multipart/form-data
export interface DetectFacesParams {
  fileUri: string; // The URI of the image file (e.g., from ImagePicker)
  fileName: string; // The name of the file (e.g., 'image.jpg')
  fileType: string; // The MIME type of the file (e.g., 'image/jpeg')
  familyId: string; // Guid
  resizeImageForAnalysis?: boolean; // FromQuery, optional
  returnCrop?: boolean; // FromQuery, optional, defaults to true
}

export interface IFaceService {
  detectFaces(params: DetectFacesParams): Promise<Result<FaceDetectionResponseDto>>;
}
