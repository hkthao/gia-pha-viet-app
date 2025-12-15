import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  TextInput,
  Button,
  Checkbox,
  Divider,
  SegmentedButtons,
  List,
  useTheme,
  Text,
  MD3Theme,
  RadioButton, // Add RadioButton
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { EventFormData, eventValidationSchema } from '@/utils/validation/eventValidationSchema';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { DateInput } from '@/components/common';
import { EventType } from '@/types'; // Assuming EventType is defined here
import * as yup from 'yup'; // Import yup for schema casting
interface EventFormProps {
  initialValues?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  isSubmitting?: boolean;
}
const getStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    scrollContent: {
      padding: SPACING_MEDIUM,
    },
    input: {
      marginBottom: SPACING_MEDIUM,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: SPACING_SMALL,
      marginTop: SPACING_MEDIUM,
    },
    segmentedButtons: {
      marginBottom: SPACING_MEDIUM,
    },
    radioGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: SPACING_MEDIUM,
    },
    radioItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: SPACING_MEDIUM,
      marginBottom: SPACING_SMALL,
    },
    lunarInputGroup: {
      flexDirection: 'row',
      marginBottom: SPACING_MEDIUM,
    },
    lunarInput: {
      flex: 1,
    },
    checkboxItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING_SMALL,
    },
    previewContainer: {
      borderWidth: 1,
      borderRadius: theme.roundness,
      padding: SPACING_MEDIUM,
      marginBottom: SPACING_MEDIUM,
      borderColor: theme.colors.outline,
    },
    previewItem: {
      paddingLeft: 0,
      paddingRight: 0,
    },
    saveButton: {
      marginTop: SPACING_MEDIUM,
      borderRadius: theme.roundness,
    },
    errorText: {
      color: theme.colors.error,
      marginBottom: SPACING_SMALL,
      marginLeft: SPACING_MEDIUM,
    },
  });
// Explicitly cast the schema to the correct type for yupResolver
const typedEventValidationSchema: yup.ObjectSchema<EventFormData> = eventValidationSchema as yup.ObjectSchema<EventFormData>;
export const EventForm: React.FC<EventFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: yupResolver(typedEventValidationSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: new Date(),
      endDate: undefined,
      location: '',
      type: EventType.Other,
      repeatAnnually: false,
      isLunarDate: false,
      lunarDay: undefined,
      lunarMonth: undefined,
      isLeapMonth: false,
      ...initialValues, // Override defaults with initial values if provided
    },
  });
  const isLunarDate = watch('isLunarDate');
  const type = watch('type');
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const lunarDay = watch('lunarDay');
  const lunarMonth = watch('lunarMonth');
  const isLeapMonth = watch('isLeapMonth');
  const name = watch('name');
  const description = watch('description');
  const location = watch('location');
  const repeatAnnually = watch('repeatAnnually');
  // Map EventType to a display string and icon
  const eventTypeOptions = useMemo(() => ([
    { label: t('eventType.birth'), value: EventType.Birth.toString() },
    { label: t('eventType.death'), value: EventType.Death.toString() },
    { label: t('eventType.marriage'), value: EventType.Marriage.toString() },
    { label: t('eventType.anniversary'), value: EventType.Anniversary.toString() },
    { label: t('eventType.other'), value: EventType.Other.toString() },
  ]), [t]);
  const eventTypeIconMap: Record<EventType, string> = {
    [EventType.Birth]: 'cake-variant',
    [EventType.Death]: 'cross',
    [EventType.Marriage]: 'ring',
    [EventType.Anniversary]: 'calendar-heart',
    [EventType.Other]: 'information',
  };
  const getEventTypeLabel = useCallback((value: EventType) => {
    const option = eventTypeOptions.find(opt => opt.value === value.toString());
    return option ? option.label : t('common.not_available');
  }, [eventTypeOptions, t]);
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Tên sự kiện */}
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('eventForm.eventName')}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            mode="outlined"
            style={styles.input}
            theme={{ colors: { primary: theme.colors.primary, outline: theme.colors.outline } }}
            error={!!errors.name}
            testID="eventNameInput"
            left={<TextInput.Icon icon="format-title" />}
          />)}
      />
      {errors.name && <Text style={styles.errorText}>{t(errors.name.message!, { fieldName: t('eventForm.eventName') })}</Text>}
      {/* Mô tả */}
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('eventForm.description')}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            theme={{ colors: { primary: theme.colors.primary, outline: theme.colors.outline } }}
            error={!!errors.description}
            testID="eventDescriptionInput"
            left={<TextInput.Icon icon="file-document-outline" />}
          />)}
      />
      {errors.description && <Text style={styles.errorText}>{t(errors.description.message!, { fieldName: t('eventForm.description') })}</Text>}
      {/* Địa điểm */}
      <Controller
        control={control}
        name="location"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('eventForm.location')}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            mode="outlined"
            style={styles.input}
            theme={{ colors: { primary: theme.colors.primary, outline: theme.colors.outline } }}
            error={!!errors.location}
            testID="eventLocationInput"
            left={<TextInput.Icon icon="map-marker" />}
          />)}
      />
      {errors.location && <Text style={styles.errorText}>{t(errors.location.message!, { fieldName: t('eventForm.location') })}</Text>}
      {/* Loại sự kiện */}
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>{t('eventForm.eventType')}:</Text>
      <Controller
        control={control}
        name="type"
        render={({ field: { onChange, value } }) => (
          <RadioButton.Group onValueChange={(val) => onChange(parseInt(val, 10))} value={value.toString()}>
            <View style={styles.radioGroup}>
              {eventTypeOptions.map((option) => (
                <View key={option.value} style={styles.radioItem}>
                  <RadioButton value={option.value} />
                  <Text style={{ color: theme.colors.onSurface }}>{option.label}</Text>
                </View>
              ))}
            </View>
          </RadioButton.Group>
        )}
      />
      {errors.type && <Text style={styles.errorText}>{t(errors.type.message!, { fieldName: t('eventForm.eventType') })}</Text>}
      <Divider style={{ marginVertical: SPACING_MEDIUM }} />
      {/* Chọn loại lịch */}
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>{t('eventForm.calendarType')}:</Text>
      <Controller
        control={control}
        name="isLunarDate"
        render={({ field: { onChange, value } }) => (
          <SegmentedButtons
            value={value ? 'lunar' : 'solar'}
            onValueChange={(val) => onChange(val === 'lunar')}
            buttons={[
              {
                label: t('eventForm.solarCalendar'), value: 'solar', style: {
                  borderRadius: theme.roundness
                }
              },
              {
                label: t('eventForm.lunarCalendar'), value: 'lunar', style: {
                  borderRadius: theme.roundness
                }
              },
            ]}
          />)}
      />
      {/* Input cho Dương lịch */}
      {!isLunarDate && (
        <>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>{t('eventForm.solarDate')}:</Text>
          <Controller
            control={control}
            name="startDate"
            render={({ field: { onChange, value } }) => (
              <DateInput
                label={t('eventForm.startDate')}
                value={value}
                onChange={onChange}
                error={!!errors.startDate}
                helperText={errors.startDate ? t(errors.startDate.message!, { fieldName: t('eventForm.startDate') }) : undefined}
              />
            )}
          />
          <Controller
            control={control}
            name="endDate"
            render={({ field: { onChange, value } }) => (
              <DateInput
                label={t('eventForm.endDate')}
                value={value}
                onChange={onChange}
                error={!!errors.endDate}
                helperText={errors.endDate ? t(errors.endDate.message!, { fieldName: t('eventForm.endDate') }) : undefined}
                minimumDate={startDate} // End date cannot be before start date
              />
            )}
          />
        </>
      )}
      {/* Input cho Âm lịch */}
      {isLunarDate && (
        <>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>{t('eventForm.lunarDate')}:</Text>
          <View style={styles.lunarInputGroup}>
            <Controller
              control={control}
              name="lunarDay"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label={t('eventForm.lunarDay')}
                  value={value?.toString()}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(parseInt(text, 10) || undefined)}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.lunarInput}
                  theme={{ colors: { primary: theme.colors.primary, outline: theme.colors.outline } }}
                  error={!!errors.lunarDay}
                  testID="lunarDayInput"
                />
              )}
            />
            {errors.lunarDay && <Text style={styles.errorText}>{t(errors.lunarDay.message!, { fieldName: t('eventForm.lunarDay') })}</Text>}
            <View style={{ width: SPACING_MEDIUM }} />
            <Controller
              control={control}
              name="lunarMonth"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label={t('eventForm.lunarMonth')}
                  value={value?.toString()}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(parseInt(text, 10) || undefined)}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.lunarInput}
                  theme={{ colors: { primary: theme.colors.primary, outline: theme.colors.outline } }}
                  error={!!errors.lunarMonth}
                  testID="lunarMonthInput"
                />
              )}
            />
            {errors.lunarMonth && <Text style={styles.errorText}>{t(errors.lunarMonth.message!, { fieldName: t('eventForm.lunarMonth') })}</Text>}
          </View>
          <Controller
            control={control}
            name="isLeapMonth"
            render={({ field: { onChange, value } }) => (
              <View style={styles.checkboxItem}>
                <Checkbox.Android
                  status={value ? 'checked' : 'unchecked'}
                  onPress={() => onChange(!value)}
                  color={theme.colors.primary}
                  testID="isLeapMonthCheckbox"
                />
                <Text style={{ color: theme.colors.onSurface }}>{t('eventForm.isLeapMonth')}</Text>
              </View>
            )}
          />
        </>
      )}
      <Divider style={{ marginVertical: SPACING_MEDIUM }} />
      {/* Lặp hàng năm */}
      <Controller
        control={control}
        name="repeatAnnually"
        render={({ field: { onChange, value } }) => (
          <View style={styles.checkboxItem}>
            <Checkbox.Android
              status={value ? 'checked' : 'unchecked'}
              onPress={() => onChange(!value)}
              color={theme.colors.primary}
              testID="repeatAnnuallyCheckbox"
            />
            <Text style={{ color: theme.colors.onSurface }}>{t('eventForm.repeatAnnually')}</Text>
          </View>
        )}
      />
      <Divider style={{ marginVertical: SPACING_MEDIUM }} />
      {/* Preview */}
      <View style={styles.previewContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>{t('eventForm.preview')}:</Text>
        <List.Section>
          <List.Item
            title={name || t('eventForm.noName')}
            left={() => <List.Icon icon={eventTypeIconMap[type] || 'information-outline'} />}
            style={styles.previewItem}
            titleStyle={{ color: theme.colors.onSurface }}
          />
          {description && (
            <List.Item
              title={description}
              left={() => <List.Icon icon="text" />}
              style={styles.previewItem}
              titleStyle={{ color: theme.colors.onSurface }}
            />
          )}
          {location && (
            <List.Item
              title={location}
              left={() => <List.Icon icon="map-marker" />}
              style={styles.previewItem}
              titleStyle={{ color: theme.colors.onSurface }}
            />
          )}
          {isLunarDate ? (
            <List.Item
              title={`${lunarDay || '--'}/${lunarMonth || '--'} ${isLeapMonth ? `(${t('eventForm.isLeapMonth')})` : ''} (${t('eventForm.lunarCalendar')})`}
              left={() => <List.Icon icon="moon-waning-gibbous" />}
              style={styles.previewItem}
              titleStyle={{ color: theme.colors.onSurface }}
            />
          ) : (
            <>
              <List.Item
                title={`${startDate ? startDate.toLocaleDateString() : '--'} (${t('eventForm.solarCalendar')})`}
                left={() => <List.Icon icon="calendar" />}
                style={styles.previewItem}
                titleStyle={{ color: theme.colors.onSurface }}
              />
              {endDate && (
                <List.Item
                  title={`${endDate.toLocaleDateString()} (${t('eventForm.solarCalendar')})`}
                  left={() => <List.Icon icon="calendar-end" />}
                  style={styles.previewItem}
                  titleStyle={{ color: theme.colors.onSurface }}
                />
              )}
            </>
          )}
          <List.Item
            title={repeatAnnually ? t('eventForm.repeatAnnuallyYes') : t('eventForm.repeatAnnuallyNo')}
            left={() => <List.Icon icon={repeatAnnually ? 'repeat' : 'repeat-off'} />}
            style={styles.previewItem}
            titleStyle={{ color: theme.colors.onSurface }}
          />
        </List.Section>
      </View>
      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={styles.saveButton}
        testID="saveEventButton"
      >
        {t('common.save')}
      </Button>
    </ScrollView>
  );
};