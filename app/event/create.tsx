import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EventForm } from '@/components/event';
import { EventFormData } from '@/utils/validation/eventValidationSchema';
import { useCreateEvent } from '@/hooks/event/useCreateEvent';

export default function CreateEventScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { date: initialDateParam } = useLocalSearchParams();
  const { mutate: createEvent, isPending: isSubmitting } = useCreateEvent();

  const initialValues: Partial<EventFormData> = {
    solarDate: typeof initialDateParam === 'string' ? new Date(initialDateParam) : new Date(),
  };

  const handleCreateEvent = useCallback(async (data: EventFormData) => {
    createEvent(data);
  }, [createEvent]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={handleCancel} color={theme.colors.onSurface} />
        <Appbar.Content title={t('eventForm.createTitle')} titleStyle={{ color: theme.colors.onSurface }} />
      </Appbar.Header>
      <EventForm initialValues={initialValues} onSubmit={handleCreateEvent} isSubmitting={isSubmitting} />
    </View>
  );
}