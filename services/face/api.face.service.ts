// apps/mobile/family_tree_rn/services/face/api.face.service.ts

import { ApiClientMethods } from '@/types';
import { Result, ApiError, FaceDetectionResponseDto } from '@/types';
import { IFaceService, DetectFacesParams } from '@/services/face/face.service.interface'; // Updated import

export class ApiFaceService implements IFaceService {
  constructor(private api: ApiClientMethods) {}

  async detectFaces(params: DetectFacesParams): Promise<Result<FaceDetectionResponseDto>> {
    try {
      const formData = new FormData();
      // Append the file
      // The 'file' parameter name must match the backend's expected parameter name
      formData.append('file', {
        uri: params.fileUri,
        name: params.fileName,
        type: params.fileType,
      } as any); // Type assertion needed for FormData in React Native context

      // Construct query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('familyId', params.familyId);
      if (params.resizeImageForAnalysis !== undefined) {
        queryParams.append('resizeImageForAnalysis', params.resizeImageForAnalysis.toString());
      }
      if (params.returnCrop !== undefined) {
        queryParams.append('returnCrop', params.returnCrop.toString());
      }

      const queryString = queryParams.toString();
      const url = `/member-faces/detect${queryString ? `?${queryString}` : ''}`;

      const response = await this.api.post<FaceDetectionResponseDto>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { isSuccess: true, value: response };
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
        statusCode: error.response?.status,
      };
      return { isSuccess: false, error: apiError };
    }
  }
}
