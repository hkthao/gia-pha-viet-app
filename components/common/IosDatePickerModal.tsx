import React, { useState, useCallback } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';

interface IosDatePickerModalProps {
  visible: boolean;
  onDismiss: () => void;
  value: Date | null | undefined;
  onChange: (date: Date | null) => void;
  mode?: 'date' | 'time' | 'datetime';
  maximumDate?: Date;
  minimumDate?: Date;
  label?: string; // Added label prop
}

const screenHeight = Dimensions.get('window').height;

const IosDatePickerModal: React.FC<IosDatePickerModalProps> = ({
  visible,
  onDismiss,
  value,
  onChange,
  mode = 'date',
  maximumDate,
  minimumDate,
  label, // Destructure new prop
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  // Update tempDate when value prop changes (e.g., when modal is reopened with a new initial value)
  React.useEffect(() => {
    setTempDate(value || new Date());
  }, [value]);

  const handleTempDateChange = useCallback((event: DateTimePickerEvent, date?: Date) => {
    // For iOS 'spinner'/'default' mode, the onChange is triggered on every scroll
    // We only want to update the actual form value when "Done" is pressed
    if (date) {
      setTempDate(date);
    }
  }, []);

  const handleDone = useCallback(() => {
    onChange(tempDate);
    onDismiss();
  }, [onChange, tempDate, onDismiss]);

  const handleCancel = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'transparent', // Changed to transparent
    },
    container: {
      backgroundColor: theme.colors.background,
      width: '100%',
      height: 320,
      borderTopLeftRadius: theme.roundness,
      borderTopRightRadius: theme.roundness,
      paddingHorizontal: SPACING_MEDIUM,
      paddingBottom: Platform.OS === 'ios' ? 30 : SPACING_MEDIUM, // Extra padding for iOS safe area
      maxHeight: screenHeight * 0.5, // Limit height
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: SPACING_SMALL,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    headerText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    pickerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onDismiss}
      animationType="slide"
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onDismiss}>
        <View style={styles.container} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Button onPress={handleCancel}>{t('common.cancel')}</Button>
            <Text style={styles.headerText}>{label || t('dateInput.selectDate')}</Text>
            <Button onPress={handleDone}>{t('common.done')}</Button>
          </View>
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={tempDate}
              mode={mode}
              display="spinner" // Use spinner display for iOS modal context
              maximumDate={maximumDate}
              minimumDate={minimumDate}
              onChange={handleTempDateChange}
              locale={"vi"} // Use current locale
              textColor={theme.colors.onSurface} // Added textColor
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default IosDatePickerModal;