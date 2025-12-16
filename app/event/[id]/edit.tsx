import React, { useCallback, useMemo } from 'react'; // Removed useState
import { View, StyleSheet } from 'react-native';
import { Appbar, useTheme, ActivityIndicator, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EventForm } from '@/components/event';
import { EventFormData } from '@/utils/validation/eventValidationSchema';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar'; // Keep this for now if any other snackbar is used
import { useEventDetails, useUpdateEvent } from '@/hooks/event'; // Import useUpdateEvent
import { SPACING_MEDIUM } from '@/constants/dimensions';
import dayjs from 'dayjs'; // Import dayjs

export default function EditEventScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { showSnackbar } = useGlobalSnackbar(); // Keep this for now

  const { id } = useLocalSearchParams();
  const eventId = Array.isArray(id) ? id[0] : id;

  const { event, isLoading, isError, error } = useEventDetails(eventId);
  const { mutate: updateEvent, isPending: isSubmitting } = useUpdateEvent();

  const initialValues = useMemo(() => {
    if (!event) return undefined;
    const solarDateObject = event.solarDate ? dayjs(event.solarDate).toDate() : undefined;
    const transformedValues: EventFormData = {
      ...event,
      solarDate: solarDateObject,
      lunarDay: event.lunarDate?.day || '',
      lunarMonth: event.lunarDate?.month || '',
      isLeapMonth: event.lunarDate?.isLeapMonth || false,
    };
    return transformedValues;
  }, [event]);

  const handleUpdateEvent = useCallback(async (data: EventFormData) => {
    await updateEvent({ id: eventId as string, formData: data });
  }, [updateEvent, eventId]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: SPACING_MEDIUM,
    },
    errorText: {
      color: theme.colors.error,
      textAlign: 'center',
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError || !event) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="titleMedium" style={styles.errorText}>
          {error?.message || t('eventForm.errors.fetchError')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={handleCancel} color={theme.colors.onSurface} />
        <Appbar.Content title={t('eventForm.editTitle')} titleStyle={{ color: theme.colors.onSurface }} />
      </Appbar.Header>
      <EventForm initialValues={initialValues} onSubmit={handleUpdateEvent} isSubmitting={isSubmitting} />
    </View>
  );
}
