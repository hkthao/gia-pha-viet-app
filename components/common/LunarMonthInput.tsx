import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, useTheme, List } from 'react-native-paper'; // Removed TextInput
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import IosDatePickerModal from './IosDatePickerModal'; // Assuming this can be reused for numeric input if modified

interface LunarMonthInputProps {
  label?: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  error?: boolean;
  helperText?: string;
  style?: any;
  maximum?: number;
  minimum?: number;
}

const LunarMonthInput: React.FC<LunarMonthInputProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  style,
  maximum = 12, // Max month in lunar year
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
      const month = selectedDate.getMonth() + 1; // Extract month from dummy date
      onChange(month);
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
        left={() => <List.Icon icon="calendar-month" />}
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
          value={value ? new Date(2000, value - 1, 1) : new Date(2000, 0, 1)} // Dummy year, day for month selection
          onChange={(date) => onChange(date ? date.getMonth() + 1 : null)}
          mode="date"
          maximumDate={new Date(2000, maximum - 1, 1)}
          minimumDate={new Date(2000, minimum - 1, 1)}
          label={label}
        />
      )}

      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={value ? new Date(2000, value - 1, 1) : new Date(2000, 0, 1)} // Dummy year, day for month selection
          mode="date"
          display="default"
          maximumDate={new Date(2000, maximum - 1, 1)}
          minimumDate={new Date(2000, minimum - 1, 1)}
          onChange={handleValueChange}
          textColor={theme.colors.onSurface}
        />
      )}
    </View>
  );
};

export default LunarMonthInput;
