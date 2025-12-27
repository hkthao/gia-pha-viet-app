import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EventForm } from '@/components/event';
import { EventFormData } from '@/utils/validation/eventValidationSchema';
import { useCreateEvent } from '@/hooks/event/useCreateEvent';
import { EventType, RepeatRule, CalendarType, LunarDateDto } from '@/types'; // Import enums and DTO

export default function CreateEventScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { mutate: createEvent, isPending: isSubmitting } = useCreateEvent();

  // Extract initial data from URL params
  const {
    name,
    description,
    solarDate, // Renamed from 'date' for clarity with EventFormData
    location,
    type,
    repeatRule,
    calendarType,
    lunarDate, // Stringified JSON
    code,
    color,
  } = useLocalSearchParams();

  const initialFormValues = useMemo(() => {
    let parsedLunarDate: LunarDateDto | undefined = undefined;
    if (typeof lunarDate === 'string') {
      try {
        parsedLunarDate = JSON.parse(lunarDate);
      } catch (e) {
        console.error("Failed to parse lunarDate from params:", e);
      }
    }

    return {
      name: typeof name === 'string' ? name : undefined,
      description: typeof description === 'string' ? description : undefined,
      solarDate: typeof solarDate === 'string' ? new Date(solarDate) : new Date(), // Default to new Date() if not provided
      location: typeof location === 'string' ? location : undefined,
      type: typeof type === 'string' && Object.values(EventType).includes(parseInt(type, 10)) ? (parseInt(type, 10) as EventType) : EventType.Other,
      repeatRule: typeof repeatRule === 'string' && Object.values(RepeatRule).includes(parseInt(repeatRule, 10)) ? (parseInt(repeatRule, 10) as RepeatRule) : RepeatRule.NONE,
      calendarType: typeof calendarType === 'string' && Object.values(CalendarType).includes(parseInt(calendarType, 10)) ? (parseInt(calendarType, 10) as CalendarType) : CalendarType.SOLAR,
      lunarDate: parsedLunarDate,
      code: typeof code === 'string' ? code : undefined,
      color: typeof color === 'string' ? color : undefined,
    };
  }, [name, description, solarDate, location, type, repeatRule, calendarType, lunarDate, code, color]);

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
      <EventForm initialValues={initialFormValues} onSubmit={handleCreateEvent} isSubmitting={isSubmitting} />
    </View>
  );
}