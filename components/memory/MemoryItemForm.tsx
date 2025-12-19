// gia-pha-viet-app/components/memory/MemoryItemForm.tsx

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Text, TextInput, useTheme, SegmentedButtons } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { SPACING_EXTRA_LARGE, SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { EmotionalTag, MemoryItemDto } from '@/types';
import { MemoryItemFormData } from '@/utils/validation/memoryItemValidationSchema'; // Will create this later
import { useMemoryItemForm } from '@/hooks/memory/useMemoryItemForm'; // Will create this later
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';

interface MemoryItemFormProps {
  initialValues?: MemoryItemDto;
  onSubmit: (data: MemoryItemFormData) => Promise<void>;
  isEditMode: boolean;
}

const getStyles = (theme: any) => StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING_MEDIUM,
    paddingBottom: SPACING_EXTRA_LARGE,
  },
  input: {
    marginBottom: SPACING_MEDIUM,
    backgroundColor: theme.colors.surface,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: SPACING_MEDIUM,
  },
  button: {
    marginHorizontal: SPACING_SMALL / 2,
    borderRadius: theme.roundness,
  },
  formSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    marginBottom: SPACING_MEDIUM,
    elevation: 1,
    padding: SPACING_MEDIUM,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: SPACING_SMALL,
  },
  datePickerContainer: {
    marginBottom: SPACING_MEDIUM,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING_SMALL,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: theme.roundness,
  },
  dateText: {
    paddingVertical: SPACING_SMALL,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING_SMALL,
    marginBottom: SPACING_MEDIUM,
  }
});

export const MemoryItemForm: React.FC<MemoryItemFormProps> = ({ initialValues, onSubmit, isEditMode }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const { control, handleSubmit, errors, setValue, isSubmitting, isValid } = useMemoryItemForm({ initialValues, onSubmit });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setValue('happenedAt', selectedDate.toISOString(), { shouldValidate: true });
    }
  };

  const getEmotionalTagOptions = () => ([
    { label: t('emotionalTag.happy'), value: EmotionalTag.Happy.toString() },
    { label: t('emotionalTag.sad'), value: EmotionalTag.Sad.toString() },
    { label: t('emotionalTag.proud'), value: EmotionalTag.Proud.toString() },
    { label: t('emotionalTag.memorial'), value: EmotionalTag.Memorial.toString() },
    { label: t('emotionalTag.neutral'), value: EmotionalTag.Neutral.toString() },
  ]);

  return (
    <View style={styles.mainContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.formSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('memory.details')}</Text>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label={t('memory.title')}
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  error={!!errors.title}
                />
              )}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label={t('memory.description')}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  error={!!errors.description}
                />
              )}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}

            <View style={styles.datePickerContainer}>
              <Text variant="bodyLarge" style={{ marginBottom: SPACING_SMALL }}>{t('memory.happenedAt')}</Text>
              <Controller
                control={control}
                name="happenedAt"
                render={({ field: { value } }) => (
                  <Button mode="outlined" onPress={() => setShowDatePicker(true)}>
                    <Text>{value ? dayjs(value).format('DD/MM/YYYY') : t('memory.selectDate')}</Text>
                  </Button>
                )}
              />
              {showDatePicker && (
                <DateTimePicker
                  value={initialValues?.happenedAt ? dayjs(initialValues.happenedAt).toDate() : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
              {errors.happenedAt && <Text style={styles.errorText}>{errors.happenedAt.message}</Text>}
            </View>

            <View style={styles.chipContainer}>
              <Text variant="bodyLarge" style={{ marginBottom: SPACING_SMALL }}>{t('memory.emotionalTag')}</Text>
              <Controller
                control={control}
                name="emotionalTag"
                render={({ field: { onChange, value } }) => (
                  <SegmentedButtons
                    value={value !== undefined ? value.toString() : EmotionalTag.Neutral.toString()}
                    onValueChange={(newValue) => onChange(parseInt(newValue, 10))}
                    buttons={getEmotionalTagOptions()}
                  />
                )}
              />
              {errors.emotionalTag && <Text style={styles.errorText}>{errors.emotionalTag.message}</Text>}
            </View>
          </View>

          {/* Placeholder for Media Upload */}
          <View style={styles.formSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('memory.media')}</Text>
            <Text>{t('memory.mediaUploadPlaceholder')}</Text>
            {/* Media upload component will go here */}
          </View>

          {/* Placeholder for Person Selection */}
          <View style={styles.formSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('memory.involvedPersons')}</Text>
            <Text>{t('memory.personSelectionPlaceholder')}</Text>
            {/* Person selection component will go here */}
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[styles.button, { marginHorizontal: 0 }]}
            loading={isSubmitting}
            disabled={isSubmitting || !isValid}
          >
            {isEditMode ? t('common.saveChanges') : t('common.create')}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
