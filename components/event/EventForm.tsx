import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  TextInput,
  Button,
  Divider,
  List,
  useTheme,
  Text,
  MD3Theme,
  RadioButton,
  Switch, // Import Switch for repeat rule
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form'; // Corrected import
import { yupResolver } from '@hookform/resolvers/yup';
import { EventFormData, eventValidationSchema, EventFormCalendarType, EventFormRepeatRule } from '@/utils/validation/eventValidationSchema';
import { SPACING_EXTRA_LARGE, SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { DateInput } from '@/components/common';
import { EventType } from '@/types'; // Assuming EventType is defined here
import * as yup from 'yup'; // Import yup for schema casting

interface EventFormProps {
  initialValues?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  isSubmitting?: boolean;
}

// Define 10 basic colors
const BASIC_COLORS = [
  '#F44336', '#E91E63', '#9C27B0', '#00BCD4', '#03A9F4',
  '#4CAF50', '#8BC34A', '#FFEB3B', '#FF9800', '#FF5722',
];

const getStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    scrollContent: {
      padding: SPACING_MEDIUM,
    },
    container: {
      marginBottom: SPACING_EXTRA_LARGE,
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

    checkboxItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING_SMALL,
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
    lunarInputRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING_MEDIUM,
    },
    lunarInput: {
      flex: 1,
    },
    lunarInputSpacer: {
      width: SPACING_MEDIUM,
    },
    colorPickerContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: SPACING_MEDIUM,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: theme.roundness,
      padding: SPACING_SMALL,
    },
    colorChip: {
      width: 32,
      height: 32,
      borderRadius: "50%",
      margin: SPACING_SMALL / 2,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedColorChip: {
      borderColor: theme.colors.primary,
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
    setValue, // Import setValue to manually update form values
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: yupResolver(typedEventValidationSchema),
    mode: 'onTouched', // Add mode to trigger validation on blur
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

  // Map EventType to a display string and icon
  const eventTypeOptions = useMemo(() => ([
    { label: t('eventType.birth'), value: EventType.Birth.toString() },
    { label: t('eventType.death'), value: EventType.Death.toString() },
    { label: t('eventType.marriage'), value: EventType.Marriage.toString() },
    { label: t('eventType.anniversary'), value: EventType.Anniversary.toString() },
    { label: t('eventType.other'), value: EventType.Other.toString() },
  ]), [t]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>

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
              readOnly // Make it read-only
            />)}
        />
        {errors.code && <Text style={styles.errorText}>{t(errors.code.message!, { fieldName: t('eventForm.eventCode') })}</Text>}

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
        <List.Section title={t('eventForm.eventType')}>
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
        </List.Section>
        <Divider />

        {/* Chọn loại lịch */}
        <List.Section title={t('eventForm.calendarType')}>
          <Controller
            control={control}
            name="calendarType"
            render={({ field: { onChange, value } }) => (
              <View> {/* Wrap in View for layout */}
                <List.Item
                  title={t('eventForm.solarCalendar')}
                  description={t('eventForm.solarCalendarDescription')}
                  left={() => <List.Icon icon="white-balance-sunny" />}
                  right={() => <RadioButton value={EventFormCalendarType.SOLAR} status={value === EventFormCalendarType.SOLAR ? 'checked' : 'unchecked'} />}
                  onPress={() => onChange(EventFormCalendarType.SOLAR)}
                  style={{ backgroundColor: theme.colors.surface, borderRadius: theme.roundness }}
                />
                <Divider />
                <List.Item
                  title={t('eventForm.lunarCalendar')}
                  description={t('eventForm.lunarCalendarDescription')}
                  left={() => <List.Icon icon="moon-waning-gibbous" />}
                  right={() => <RadioButton value={EventFormCalendarType.LUNAR} status={value === EventFormCalendarType.LUNAR ? 'checked' : 'unchecked'} />}
                  onPress={() => onChange(EventFormCalendarType.LUNAR)}
                  style={{ backgroundColor: theme.colors.surface, borderRadius: theme.roundness }}
                />
              </View>
            )}
          />
        </List.Section>
        {/* Input cho Dương lịch */}
        {watch('calendarType') === EventFormCalendarType.SOLAR && ( // Conditional on calendarType
          <>
            <Divider style={{ marginBottom: SPACING_MEDIUM }} />
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
            <Divider style={{ marginBottom: SPACING_MEDIUM }} />
            <View style={styles.lunarInputRow}>
              <Controller
                control={control}
                name="lunarDay"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label={t('eventForm.lunarDay')}
                    value={value?.toString()} // Convert number to string for TextInput
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(parseInt(text, 10))} // Convert string to number for onChange
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.lunarInput}
                    theme={{ colors: { primary: theme.colors.primary, outline: theme.colors.outline } }}
                    error={!!errors.lunarDay}
                    testID="lunarDayInput"
                  />
                )}
              />
              <View style={styles.lunarInputSpacer} />
              <Controller
                control={control}
                name="lunarMonth"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label={t('eventForm.lunarMonth')}
                    value={value?.toString()} // Convert number to string for TextInput
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(parseInt(text, 10))} // Convert string to number for onChange
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.lunarInput}
                    theme={{ colors: { primary: theme.colors.primary, outline: theme.colors.outline } }}
                    error={!!errors.lunarMonth}
                    testID="lunarMonthInput"
                  />
                )}
              />
            </View>
            {errors.lunarDay && <Text style={styles.errorText}>{t(errors.lunarDay.message!, { fieldName: t('eventForm.lunarDay') })}</Text>}
            {errors.lunarMonth && <Text style={styles.errorText}>{t(errors.lunarMonth.message!, { fieldName: t('eventForm.lunarMonth') })}</Text>}

            <Divider />

            <Controller
              control={control}
              name="isLeapMonth"
              render={({ field: { onChange, value } }) => (
                <List.Item
                  title={t('eventForm.isLeapMonth')}
                  left={() => <List.Icon icon="calendar-alert" />}
                  right={() => (
                    <Switch
                      value={value || false}
                      onValueChange={onChange}
                      testID="isLeapMonthSwitch"
                    />
                  )}
                  onPress={() => onChange(!value)}
                  style={{ backgroundColor: theme.colors.surface, borderRadius: theme.roundness }}
                />
              )}
            />
          </>
        )}

        <Divider />

        {/* Lặp hàng năm */}
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

        <Divider style={{marginBottom: SPACING_MEDIUM}} />

        {/* Màu hiển thị */}
        <View style={styles.colorPickerContainer}>
          {BASIC_COLORS.map((colorHex) => (
            <TouchableOpacity
              key={colorHex}
              style={[
                styles.colorChip,
                { backgroundColor: colorHex },
                watch('color') === colorHex && styles.selectedColorChip,
              ]}
              onPress={() => setValue('color', colorHex, { shouldValidate: true })}
            />
          ))}
        </View>
        {errors.color && <Text style={styles.errorText}>{t(errors.color.message!, { fieldName: t('eventForm.color') })}</Text>}

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
      </View>
    </ScrollView>
  );
};