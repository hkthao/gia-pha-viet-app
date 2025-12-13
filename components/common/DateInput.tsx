import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import IosDatePickerModal from './IosDatePickerModal'; // Import IosDatePickerModal

interface DateInputProps {
  label?: string;
  value: Date | null | undefined;
  onChange: (date: Date | null) => void;
  error?: boolean;
  helperText?: string;
  style?: any; // StyleProp<ViewStyle> is causing issues, using any for now
  mode?: 'date' | 'time' | 'datetime';
  maximumDate?: Date;
  minimumDate?: Date;
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  style,
  mode = 'date',
  maximumDate,
  minimumDate,
}) => {
  useTranslation();
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const formattedDate = useMemo(() => {
    if (value instanceof Date && !isNaN(value.getTime())) {
      // Format as dd/MM/yyyy
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(value);
    }
    return '';
  }, [value]);

  const handlePress = useCallback(() => {
    setShowPicker(true);
  }, []);

  const handleDateChange = useCallback((event: any, selectedDate: Date | undefined) => {
    setShowPicker(false);
    if (selectedDate !== undefined) {
      onChange(selectedDate);
    }
  }, [onChange]);

  const styles = StyleSheet.create({
    container: {
      marginBottom: SPACING_MEDIUM,
    },
    input: {
      backgroundColor: theme.colors.surface,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <TextInput
        label={label}
        value={formattedDate}
        mode="outlined"
        readOnly
        onPressIn={handlePress} // Open picker when TextInput is pressed
        left={<TextInput.Icon icon="calendar" onPress={handlePress} />}
        error={error}
        style={styles.input}
      />
      {helperText && error && <Text style={{ color: theme.colors.error }}>{helperText}</Text>}

      {Platform.OS === 'ios' && (
        <IosDatePickerModal
          visible={showPicker}
          onDismiss={() => setShowPicker(false)}
          value={value}
          onChange={onChange}
          mode={mode}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          label={label}
        />
      )}

      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={value || new Date()} // Use current value or default to today
          mode={mode}
          display="default" // Android default display
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={handleDateChange}
          textColor={theme.colors.onSurface} // Added textColor
        />
      )}
    </View>
  );
};

export default DateInput;