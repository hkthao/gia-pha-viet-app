import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EventFormData } from '@/utils/validation/eventValidationSchema';
import { eventService } from '@/services';
import { useTranslation } from 'react-i18next';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar';
import { useRouter } from 'expo-router';
import { CreateEventRequestDto } from '@/types'; // Import CreateEventRequestDto
import { useFamilyStore } from '@/stores/useFamilyStore';

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showSnackbar } = useGlobalSnackbar();
  const router = useRouter();
  const { currentFamilyId } = useFamilyStore();

  return useMutation({
    mutationFn: async (eventData: EventFormData) => {
      if (!currentFamilyId) {
        throw new Error('Family ID is not available. Cannot create event.');
      }

      const createRequest: CreateEventRequestDto = {
        familyId: currentFamilyId,
        name: eventData.name,
        code: eventData.code,
        color: eventData.color,
        description: eventData.description,
        solarDate: eventData.solarDate?.toISOString(),
        location: eventData.location,
        type: eventData.type,
        repeatRule: eventData.repeatRule,
        calendarType: eventData.calendarType,
        lunarDay: eventData.lunarDay,
        lunarMonth: eventData.lunarMonth,
        isLeapMonth: eventData.isLeapMonth,
      };

      return await eventService.create(createRequest);
    },
    onSuccess: () => {
      showSnackbar(t('eventForm.createSuccess'), 'success');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingEvents'] });
      router.back();
    },
    onError: (error) => {
      console.error('Error creating event:', error);
      showSnackbar(t('eventForm.createError'), 'error');
    },
  });
};
