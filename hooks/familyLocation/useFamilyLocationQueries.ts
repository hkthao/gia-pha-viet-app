import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FamilyLocationDto,
  CreateFamilyLocationRequestDto,
  UpdateFamilyLocationRequestDto,
  SearchFamilyLocationsQuery,
  Result, // Import Result
  PaginatedList,
} from '@/types';
import { familyLocationService } from '@/services'; // Access the service through index.ts
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore'; // Import useCurrentFamilyStore for familyId
import { FamilyLocationFormData } from '@/utils/validation/familyLocationValidationSchema'; // Import FamilyLocationFormData

export const familyLocationQueryKeys = {
  all: ['familyLocations'] as const,
  lists: () => [...familyLocationQueryKeys.all, 'list'] as const,
  list: (filters: SearchFamilyLocationsQuery) => [...familyLocationQueryKeys.lists(), filters] as const,
  details: () => [...familyLocationQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...familyLocationQueryKeys.details(), id] as const,
};

// Hook for fetching a paginated list of family locations
export const useFamilyLocations = (filters: SearchFamilyLocationsQuery) => {
  return useQuery<PaginatedList<FamilyLocationDto>, Error>({ // Corrected PaginatedResult to PaginatedList
    queryKey: familyLocationQueryKeys.list(filters),
    queryFn: async () => {
      const response = await familyLocationService.search(filters);
      if (response.isSuccess && response.value) { // Corrected success to isSuccess, data to value
        return response.value; // Corrected data to value
      }
      throw new Error(response.error?.message || 'Failed to fetch family locations'); // Corrected errorMessage to error?.message
    },
    // Keep data fresh for 5 minutes
    staleTime: 1000 * 60 * 5,
  });
};

// Hook for fetching a single family location by ID
export const useFamilyLocation = (id: string) => {
  return useQuery<FamilyLocationDto, Error>({
    queryKey: familyLocationQueryKeys.detail(id),
    queryFn: async () => {
      const response = await familyLocationService.getById(id);
      if (response.isSuccess && response.value) { // Corrected success to isSuccess, data to value
        return response.value; // Corrected data to value
      }
      throw new Error(response.error?.message || 'Failed to fetch family location'); // Corrected errorMessage to error?.message
    },
    enabled: !!id, // Only run the query if ID is available
  });
};

// Hook for creating a family location
export const useCreateFamilyLocation = () => {
  const queryClient = useQueryClient();
  return useMutation<Result<FamilyLocationDto>, Error, CreateFamilyLocationRequestDto>({
    mutationFn: async (newFamilyLocation) => {
      const response = await familyLocationService.create(newFamilyLocation);
      if (response.isSuccess) { // Corrected success to isSuccess
        return response;
      }
      throw new Error(response.error?.message || 'Failed to create family location'); // Corrected errorMessage to error?.message
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyLocationQueryKeys.lists() });
    },
  });
};

// Hook for updating a family location
export const useUpdateFamilyLocation = () => {
  const queryClient = useQueryClient();
  const { currentFamilyId } = useCurrentFamilyStore(); // Get currentFamilyId

  return useMutation<Result<FamilyLocationDto>, Error, { id: string; formData: FamilyLocationFormData }>({
    mutationFn: async ({ id, formData }) => {
      if (!currentFamilyId) {
        throw new Error('Family ID is missing.'); // Or a more user-friendly message
      }

      const updateRequest: UpdateFamilyLocationRequestDto = {
        id: id,
        familyId: currentFamilyId, // Use currentFamilyId
        name: formData.name,
        description: formData.description,
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.address,
        locationType: formData.locationType,
        accuracy: formData.accuracy,
        source: formData.source,
      };

      const response = await familyLocationService.update(id, updateRequest);
      if (response.isSuccess) {
        return response;
      }
      throw new Error(response.error?.message || 'Failed to update family location');
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: familyLocationQueryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: familyLocationQueryKeys.lists() });
    },
  });
};

// Hook for deleting a family location
export const useDeleteFamilyLocation = () => {
  const queryClient = useQueryClient();
  return useMutation<Result<void>, Error, string>({
    mutationFn: async (id) => {
      const response = await familyLocationService.delete(id);
      if (response.isSuccess) { // Corrected success to isSuccess
        return response;
      }
      throw new Error(response.error?.message || 'Failed to delete family location'); // Corrected errorMessage to error?.message
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyLocationQueryKeys.lists() });
    },
  });
};
