import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EventForm } from '@/components/event';
import { EventFormData } from '@/utils/validation/eventValidationSchema';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar'; // Assuming useSnackbar exists

export default function CreateEventScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { date: initialDateParam } = useLocalSearchParams();
  const { showSnackbar } = useGlobalSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: Partial<EventFormData> = {
    solarDate: typeof initialDateParam === 'string' ? new Date(initialDateParam) : new Date(),
  };

  const handleCreateEvent = useCallback(async (data: EventFormData) => {
    setIsSubmitting(true);
    console.log('Creating event with data:', data);
    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        showSnackbar(t('eventForm.createSuccess'), 'success');
        router.back();
        resolve();
      }, 1500);
    }).finally(() => {
      setIsSubmitting(false);
    });
  }, [router, showSnackbar, t]);

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