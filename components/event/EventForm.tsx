import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  TextInput,
  Button,
  Checkbox,
  Divider,
  List,
  useTheme,
  Text,
  MD3Theme,
  RadioButton,
  Switch, // Import Switch for repeat rule
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { EventFormData, eventValidationSchema, EventFormCalendarType, EventFormRepeatRule } from '@/utils/validation/eventValidationSchema';
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
      code: '', // New field
      color: '', // New field
      description: '',
      solarDate: undefined, // Renamed from startDate, removed endDate
      location: '',
      type: EventType.Other,
      repeatRule: EventFormRepeatRule.NONE, // Changed from repeatAnnually
      calendarType: EventFormCalendarType.SOLAR, // Changed from isLunarDate
      lunarDay: undefined,
      lunarMonth: undefined,
      isLeapMonth: false,
      ...initialValues, // Override defaults with initial values if provided
    },
  });
    const isLunarDate = watch('calendarType') === EventFormCalendarType.LUNAR; // Derive from calendarType
    const type = watch('type');
    const solarDate = watch('solarDate'); // Renamed from startDate
    const lunarDay = watch('lunarDay');
    const lunarMonth = watch('lunarMonth');
    const isLeapMonth = watch('isLeapMonth');
    const name = watch('name');
    const code = watch('code'); // New field
    const color = watch('color'); // New field
    const description = watch('description');
    const location = watch('location');
    const repeatRule = watch('repeatRule'); // Changed from repeatAnnually
  
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
  
        {/* Mã sự kiện */}
        <Controller
          control={control}
          name="code"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label={t('eventForm.eventCode')}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              mode="outlined"
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary, outline: theme.colors.outline } }}
              error={!!errors.code}
              testID="eventCodeInput"
              left={<TextInput.Icon icon="identifier" />}
            />)}
        />
        {errors.code && <Text style={styles.errorText}>{t(errors.code.message!, { fieldName: t('eventForm.eventCode') })}</Text>}
  
        {/* Màu hiển thị */}
        <Controller
          control={control}
          name="color"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label={t('eventForm.color')}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              mode="outlined"
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary, outline: theme.colors.outline } }}
              error={!!errors.color}
              testID="eventColorInput"
              left={<TextInput.Icon icon="palette" />}
            />)}
        />
        {errors.color && <Text style={styles.errorText}>{t(errors.color.message!, { fieldName: t('eventForm.color') })}</Text>}
  
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
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => onChange(parseInt(option.value, 10))}
                    style={styles.radioItem}
                  >
                    <RadioButton value={option.value} status={value.toString() === option.value ? 'checked' : 'unchecked'} />
                    <Text style={{ color: theme.colors.onSurface }}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </RadioButton.Group>
          )}
        />
        {errors.type && <Text style={styles.errorText}>{t(errors.type.message!, { fieldName: t('eventForm.eventType') })}</Text>}
  
        <Divider style={{ marginVertical: SPACING_MEDIUM }} />
  
        {/* Chọn loại lịch */}
              {/* Chọn loại lịch */}
              <List.Section title={t('eventForm.calendarType')} style={{ marginTop: SPACING_MEDIUM }}>
                <Controller
                  control={control}
                  name="calendarType"
                  render={({ field: { onChange, value } }) => (
                    <RadioButton.Group onValueChange={onChange} value={value}>
                      <List.Item
                        title={t('eventForm.solarCalendar')}
                        description={t('eventForm.solarCalendarDescription')}
                        left={() => <List.Icon icon="white-balance-sunny" />}
                        right={() => <RadioButton value={EventFormCalendarType.SOLAR} />}
                        onPress={() => onChange(EventFormCalendarType.SOLAR)}
                        style={{ backgroundColor: theme.colors.surface, borderRadius: theme.roundness }}
                      />
                      <Divider />
                      <List.Item
                        title={t('eventForm.lunarCalendar')}
                        description={t('eventForm.lunarCalendarDescription')}
                        left={() => <List.Icon icon="moon-waning-gibbous" />}
                        right={() => <RadioButton value={EventFormCalendarType.LUNAR} />}
                        onPress={() => onChange(EventFormCalendarType.LUNAR)}
                        style={{ backgroundColor: theme.colors.surface, borderRadius: theme.roundness }}
                      />
                    </RadioButton.Group>
                  )}
                />
              </List.Section>  
        {/* Input cho Dương lịch */}
        {watch('calendarType') === EventFormCalendarType.SOLAR && ( // Conditional on calendarType
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>{t('eventForm.solarDate')}:</Text>
            <Controller
              control={control}
              name="solarDate"
              render={({ field: { onChange, value } }) => (
                <DateInput
                  label={t('eventForm.solarDate')}
                  value={value}
                  onChange={onChange}
                  error={!!errors.solarDate}
                  helperText={errors.solarDate ? t(errors.solarDate.message!, { fieldName: t('eventForm.solarDate') }) : undefined}
                />
              )}
            />
  
                      </>
        )}
  
        {/* Input cho Âm lịch */}
        {watch('calendarType') === EventFormCalendarType.LUNAR && ( // Conditional on calendarType
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
  
              {/* Lặp hàng năm */}
              <List.Section title={t('eventForm.repeatRuleTitle')} style={{ marginTop: SPACING_MEDIUM }}>
                <Controller
                  control={control}
                  name="repeatRule"
                  render={({ field: { onChange, value } }) => (
                    <List.Item
                      title={t('eventForm.repeatAnnually')}
                      description={value === EventFormRepeatRule.YEARLY ? t('eventForm.repeatAnnuallyYes') : t('eventForm.repeatAnnuallyNo')}
                      left={() => <List.Icon icon="repeat" />}
                      right={() => (
                        <Switch
                          value={value === EventFormRepeatRule.YEARLY}
                          onValueChange={(newValue) => onChange(newValue ? EventFormRepeatRule.YEARLY : EventFormRepeatRule.NONE)}
                        />
                      )}
                      onPress={() => onChange(value === EventFormRepeatRule.YEARLY ? EventFormRepeatRule.NONE : EventFormRepeatRule.YEARLY)}
                      style={{ backgroundColor: theme.colors.surface, borderRadius: theme.roundness }}
                    />
                  )}
                />
              </List.Section>  
        <Divider style={{ marginVertical: SPACING_MEDIUM }} />
  
        {/* Preview */}
        <View style={styles.previewContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>{t('eventForm.preview')}</Text>
          <List.Section>
            <List.Item
              title={name || t('eventForm.noName')}
              left={() => <List.Icon icon={eventTypeIconMap[type] || 'information-outline'} />}
              style={styles.previewItem}
              titleStyle={{ color: theme.colors.onSurface }}
            />
            {code && (
              <List.Item
                title={code}
                left={() => <List.Icon icon="identifier" />}
                style={styles.previewItem}
                titleStyle={{ color: theme.colors.onSurface }}
              />
            )}
            {color && (
              <List.Item
                title={color}
                left={() => <List.Icon icon="palette" />}
                style={styles.previewItem}
                titleStyle={{ color: theme.colors.onSurface }}
              />
            )}
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
              <List.Item
                title={`${solarDate ? solarDate.toLocaleDateString() : '--'} (${t('eventForm.solarCalendar')})`}
                left={() => <List.Icon icon="calendar" />}
                style={styles.previewItem}
                titleStyle={{ color: theme.colors.onSurface }}
              />
            )}
            <List.Item
              title={repeatRule === EventFormRepeatRule.YEARLY ? t('eventForm.repeatAnnuallyYes') : t('eventForm.repeatAnnuallyNo')}
              left={() => <List.Icon icon={repeatRule === EventFormRepeatRule.YEARLY ? 'repeat' : 'repeat-off'} />}
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