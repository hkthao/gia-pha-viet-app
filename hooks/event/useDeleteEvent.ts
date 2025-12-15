import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services';
import { useTranslation } from 'react-i18next';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar';
import { useRouter } from 'expo-router';

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showSnackbar } = useGlobalSnackbar();
  const router = useRouter();

  const {
    mutate: deleteEvent,
    isPending: isDeleting,
    isError: isDeleteError,
    error: deleteError,
  } = useMutation({
    mutationFn: async (eventId: string) => {
      const result = await eventService.delete(eventId);
      if (result.isSuccess) {
        return result.value;
      } else {
        throw new Error(result.error?.message || t('eventDetail.errors.deleteError'));
      }
    },
    onSuccess: () => {
      showSnackbar(t('eventDetail.deleteSuccess'), 'success');
      // Invalidate relevant queries to refetch data after deletion
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['familyEvents'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingEvents'] });
      router.back(); // Navigate back after successful deletion
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
      showSnackbar(error.message, 'error');
    },
  });

  return { deleteEvent, isDeleting, isDeleteError, deleteError };
};
