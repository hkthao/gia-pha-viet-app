import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { faceService } from '@/services';
import { DetectedFaceDto } from '@/types';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar'; // Import useGlobalSnackbar

interface UseFaceDataDetailsResult {
  faceData?: DetectedFaceDto;
  loading: boolean;
  error?: string;
  handleEditFaceData: () => void;
  handleDeleteFaceData: () => void;
  deleteLoading: boolean;
}

export function useFaceDataDetails(faceDataId: string): UseFaceDataDetailsResult {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showSnackbar } = useGlobalSnackbar();

  // Query to fetch face data details
  const {
    data: faceData,
    isLoading: loading,
    error: fetchError,
  } = useQuery<DetectedFaceDto, Error>({
    queryKey: ['faces', faceDataId],
    queryFn: async () => {
      const result = await faceService.getById(faceDataId);
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(result.error?.message || t('faceDataDetail.errors.fetchError'));
    },
    enabled: !!faceDataId, // Only run query if faceDataId is available
  });

  // Mutation for deleting face data
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (idToDelete) => {
      const result = await faceService.delete(idToDelete);
      if (!result.isSuccess) {
        throw new Error(result.error?.message || t('faceDataDetail.errors.deleteError'));
      }
    },
    onSuccess: () => {
      showSnackbar(t('faceDataDetail.deleteSuccess'), 'success');
      // Invalidate queries to refresh the list of faces
      queryClient.invalidateQueries({ queryKey: ['faces', 'search'] });
      router.back(); // Navigate back after successful deletion
    },
    onError: (err) => {
      console.error('Error deleting face data:', err);
      showSnackbar(err.message, 'error');
    },
  });

  const handleEditFaceData = useCallback(() => {
    // TODO: Implement navigation to an edit screen for face data
    // router.push(`/family/face-data/${faceDataId}/edit`);
    showSnackbar(t('common.featureUnderDevelopment'), 'info'); // Placeholder
  }, [faceDataId, router, showSnackbar, t]);

  const handleDeleteFaceData = useCallback(() => {
    Alert.alert(
      t('common.confirm'),
      t('faceDataDetail.deleteConfirmMessage', { id: faceDataId }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteMutation.mutate(faceDataId),
        },
      ],
      { cancelable: true }
    );
  }, [faceDataId, deleteMutation, t]);

  return {
    faceData,
    loading,
    error: fetchError?.message,
    handleEditFaceData,
    handleDeleteFaceData,
    deleteLoading: deleteMutation.isPending,
  };
}