import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, Text, useTheme, List } from 'react-native-paper'; // Import List
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import IosDatePickerModal from './IosDatePickerModal'; // Assuming this can be reused for numeric input if modified

interface LunarDayInputProps {
  label?: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  error?: boolean;
  helperText?: string;
  style?: any;
  maximum?: number;
  minimum?: number;
}

const LunarDayInput: React.FC<LunarDayInputProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  style,
  maximum = 30, // Max day in lunar month
  minimum = 1,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const formattedValue = useMemo(() => {
    return value !== null && value !== undefined ? value.toString() : '';
  }, [value]);

  const handlePress = useCallback(() => {
    setShowPicker(true);
  }, []);

  const handleValueChange = useCallback((event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate !== undefined) {
      const day = selectedDate.getDate(); // Extract day from dummy date
      onChange(day);
    }
  }, [onChange]);

  const styles = StyleSheet.create({
    container: {
      marginBottom: SPACING_MEDIUM,
    },
    listItem: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness,
    },
    valueText: {
      color: theme.colors.onSurfaceVariant,
    },
    errorText: {
      color: theme.colors.error,
      marginLeft: SPACING_MEDIUM,
      marginTop: SPACING_MEDIUM,
    }
  });

  return (
    <View style={[styles.container, style]}>
      <List.Item
        title={label}
        description={error ? helperText : formattedValue || t('common.not_available')}
        left={() => <List.Icon icon="calendar-today" />}
        onPress={handlePress}
        style={styles.listItem}
        descriptionStyle={error && { color: theme.colors.error }}
        right={() => (
          <Text style={styles.valueText}>
            {formattedValue}
          </Text>
        )}
      />

      {Platform.OS === 'ios' && (
        <IosDatePickerModal
          visible={showPicker}
          onDismiss={() => setShowPicker(false)}
          value={value ? new Date(2000, 0, value) : new Date(2000, 0, minimum)} // Dummy year, month for day selection
          onChange={(date) => onChange(date ? date.getDate() : null)}
          mode="date"
          maximumDate={new Date(2000, 0, maximum)}
          minimumDate={new Date(2000, 0, minimum)}
          label={label}
        />
      )}

      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={value ? new Date(2000, 0, value) : new Date(2000, 0, minimum)} // Dummy year, month for day selection
          mode="date"
          display="default"
          maximumDate={new Date(2000, 0, maximum)}
          minimumDate={new Date(2000, 0, minimum)}
          onChange={handleValueChange}
          textColor={theme.colors.onSurface}
        />
      )}
    </View>
  );
};

export default LunarDayInput;
