import React, { useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, useTheme, ActivityIndicator, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EventForm } from '@/components/event';
import { EventFormData } from '@/utils/validation/eventValidationSchema';
import { useEventDetails } from '@/hooks/event/useEventDetails';
import { useUpdateEvent } from '@/hooks/event/useUpdateEvent';
import { SPACING_MEDIUM } from '@/constants/dimensions';

export default function EditEventScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();

  const eventId = Array.isArray(id) ? id[0] : id;

  const { event, isLoading, error, refetch } = useEventDetails(eventId);
  const { mutate: updateEvent, isPending: isSubmitting } = useUpdateEvent();

  useEffect(() => {
    if (eventId) {
      refetch();
    }
  }, [eventId, refetch]);

  const initialValues: Partial<EventFormData> | undefined = useMemo(() => {
    if (!event) return undefined;

    return {
      name: event.name,
      description: event.description,
      code: event.code,
      location: event.location,
      solarDate: event.solarDate ? new Date(event.solarDate) : undefined,
      lunarDate: event.lunarDate ? {
        day: event.lunarDate.day,
        month: event.lunarDate.month,
        isLeapMonth: event.lunarDate.isLeapMonth,
      } : undefined,
      type: event.type,
      calendarType: event.calendarType,
      repeatRule: event.repeatRule,
      familyId: event.familyId,
      relatedMemberIds: event.relatedMembers?.map(member => member.id),
    };
  }, [event]);

  const handleUpdateEvent = useCallback(async (data: EventFormData) => {
    if (!eventId) {
      Alert.alert(t('common.error'), t('eventForm.errors.eventIdMissing'));
      return;
    }
    updateEvent({ id: eventId, formData: data });
  }, [eventId, updateEvent, t]);

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
    },
    errorContainer: {
      padding: SPACING_MEDIUM,
      backgroundColor: theme.colors.errorContainer,
      marginBottom: SPACING_MEDIUM,
    },
    errorText: {
      color: theme.colors.onErrorContainer,
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

  if (error || !event) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
          <Appbar.BackAction onPress={handleCancel} color={theme.colors.onSurface} />
          <Appbar.Content title={t('eventForm.editTitle')} titleStyle={{ color: theme.colors.onSurface }} />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="bodyMedium" style={styles.errorText}>
            {t('common.error_occurred')}: {error?.message || t('eventForm.errors.eventNotFound')}
          </Text>
        </View>
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