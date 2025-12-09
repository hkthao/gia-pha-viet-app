// services/face/api.face.service.ts

import { ApiClientMethods } from '@/types';
import { Result, ApiError, DetectedFaceDto, PaginatedList, SearchFacesQuery, FaceDetectionResponseDto } from '@/types';
import { IFaceService, DetectFacesRequest } from '@/services/face/face.service.interface';

export class ApiFaceService implements IFaceService {
  constructor(private api: ApiClientMethods) {}

  async getById(id: string): Promise<Result<DetectedFaceDto>> {
    try {
      const response = await this.api.get<DetectedFaceDto>(`/member-faces/${id}`);
      return { isSuccess: true, value: response };
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
        statusCode: error.response?.status,
      };
      return { isSuccess: false, error: apiError };
    }
  }

  async search(query: SearchFacesQuery): Promise<Result<PaginatedList<DetectedFaceDto>>> {
    try {
      const response = await this.api.get<PaginatedList<DetectedFaceDto>>('/member-faces/search', {
        params: query,
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

  async create(entity: Partial<DetectedFaceDto>): Promise<Result<DetectedFaceDto>> {
    try {
      const response = await this.api.post<DetectedFaceDto>('/face', entity);
      return { isSuccess: true, value: response };
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
        statusCode: error.response?.status,
      };
      return { isSuccess: false, error: apiError };
    }
  }

  async update(id: string, entity: Partial<DetectedFaceDto>): Promise<Result<DetectedFaceDto>> {
    try {
      const response = await this.api.put<DetectedFaceDto>(`/member-faces/${id}`, entity);
      return { isSuccess: true, value: response };
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
        statusCode: error.response?.status,
      };
      return { isSuccess: false, error: apiError };
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.api.delete(`/face/${id}`);
      return { isSuccess: true, value: undefined };
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
        statusCode: error.response?.status,
      };
      return { isSuccess: false, error: apiError };
    }
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

      // Append other parameters
      formData.append('familyId', request.familyId);
      formData.append('returnCrop', request.returnCrop.toString());

      const response = await this.api.post<FaceDetectionResponseDto>('/member-faces/detect', formData, {
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