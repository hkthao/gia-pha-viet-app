// services/face/api.face.service.ts

import { Result, DetectedFaceDto, SearchFacesQuery, FaceDetectionResponseDto, CreateFaceDataRequestDto } from '@/types';
import { IFaceService, DetectFacesRequest } from '@/services/face/face.service.interface';
import { GenericService } from '@/services/base/abstract.generic.service'; // Import GenericService
import { ResultHelper } from '@/utils/resultUtils'; // Import ResultHelper
import { parseError } from '@/utils/errorUtils'; // Import parseError

export class ApiFaceService extends GenericService<DetectedFaceDto, SearchFacesQuery, DetectedFaceDto, CreateFaceDataRequestDto, DetectedFaceDto> implements IFaceService {
  protected get baseEndpoint(): string {
    return '/member-faces';
  }



  async detectFaces(request: DetectFacesRequest): Promise<Result<FaceDetectionResponseDto>> {
    try {
      const formData = new FormData();
      // Append the image file
      formData.append('file', {
        uri: request.fileUri,
        name: request.fileName,
        type: request.fileType,
      } as any); // Type assertion for FormData.append

      // Construct query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('familyId', request.familyId);
      queryParams.append('returnCrop', request.returnCrop.toString());

      const url = `/member-faces/detect?${queryParams.toString()}`;

      const response = await this.apiClient.post<FaceDetectionResponseDto>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return ResultHelper.success(response);
    } catch (error: any) {
      return ResultHelper.fail(parseError(error));
    }
  }
}