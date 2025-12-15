import React, { useState, useMemo } from 'react'; // Added useMemo
import { View, StyleSheet, Platform, ScrollView } from 'react-native';
import { Appbar, useTheme, Text, RadioButton, TextInput, Button, Checkbox, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

type CalendarType = 'solar' | 'lunar';

const EventFormScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { date: initialDateParam } = useLocalSearchParams();
  const initialDate = typeof initialDateParam === 'string' ? initialDateParam : '';

  const [calendarType, setCalendarType] = useState<CalendarType>('solar');
  const [solarDate, setSolarDate] = useState<Date>(initialDate ? new Date(initialDate) : new Date());
  const [showSolarDatePicker, setShowSolarDatePicker] = useState(false);

  const [lunarDay, setLunarDay] = useState<string>('');
  const [lunarMonth, setLunarMonth] = useState<string>('');
  const [isLeapMonth, setIsLeapMonth] = useState<boolean>(false); // Tháng nhuận

  const [eventName, setEventName] = useState<string>('');
  const [repeatAnnually, setRepeatAnnually] = useState<boolean>(false);

  const onSolarDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || solarDate;
    setShowSolarDatePicker(Platform.OS === 'ios');
    setSolarDate(currentDate);
  };

  const handleSave = () => {
    console.log('Saving event:', {
      calendarType,
      solarDate,
      lunarDay,
      lunarMonth,
      isLeapMonth,
      eventName,
      repeatAnnually,
    });
    // TODO: Gửi dữ liệu sự kiện đến backend
    router.back();
  };

  // Giả lập preview (sẽ cần logic chuyển đổi âm dương thực tế)
  const renderPreview = () => {
    if (calendarType === 'solar') {
      const date = solarDate.toISOString().split('T')[0];
      return (
        <Text style={{ color: theme.colors.onSurfaceVariant }}>
          📆 Sẽ diễn ra vào:
          {'\n'}→ {date}
          {'\n'}→ (Chưa có thông tin âm lịch)
        </Text>
      );
    } else {
      return (
        <Text style={{ color: theme.colors.onSurfaceVariant }}>
          📆 Sẽ diễn ra vào:
          {'\n'}→ (Chưa có thông tin dương lịch)
          {'\n'}→ {lunarDay}/{lunarMonth} {isLeapMonth ? '(Nhuận)' : ''} âm lịch
        </Text>
      );
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
    },
    input: {
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      marginTop: 10,
    },
    radioGroup: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginBottom: 15,
    },
    radioItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 20,
    },
    divider: {
      marginVertical: 20,
    },
    datePickerButton: {
      marginBottom: 15,
      justifyContent: 'center',
      paddingVertical: 8,
    },
    lunarInputGroup: {
      flexDirection: 'row',
      marginBottom: 15,
    },
    lunarInput: {
      flex: 1,
    },
    checkboxItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    previewContainer: {
      borderWidth: 1,
      borderRadius: theme.roundness,
      padding: 15,
      marginBottom: 20,
      // borderColor will be set by theme
    },
    saveButton: {
      marginTop: 20,
    },
  }), [theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => router.back()} color={theme.colors.onSurface} />
        <Appbar.Content title="Tạo / Sửa Sự Kiện" titleStyle={{ color: theme.colors.onSurface }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tên sự kiện */}
        <TextInput
          label="Tên sự kiện"
          value={eventName}
          onChangeText={setEventName}
          mode="outlined"
          style={styles.input}
          theme={{ colors: { primary: theme.colors.primary, outline: theme.colors.outline } }}
        />

        {/* Chọn loại lịch */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Chọn loại lịch:</Text>
        <View style={styles.radioGroup}>
          <RadioButton.Group onValueChange={(newValue) => setCalendarType(newValue as CalendarType)} value={calendarType}>
            <View style={styles.radioItem}>
              <RadioButton value="solar" />
              <Text style={{ color: theme.colors.onSurface }}>Dương lịch</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="lunar" />
              <Text style={{ color: theme.colors.onSurface }}>Âm lịch</Text>
            </View>
          </RadioButton.Group>
        </View>

        <Divider style={styles.divider} />

        {/* Input cho Dương lịch */}
        {calendarType === 'solar' && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Ngày Dương Lịch:</Text>
            <Button onPress={() => setShowSolarDatePicker(true)} mode="outlined" style={styles.datePickerButton}>
              <Text>{solarDate.toLocaleDateString('vi-VN')}</Text>
            </Button>
            {showSolarDatePicker && (
              <DateTimePicker
                value={solarDate}
                mode="date"
                display="default"
                onChange={onSolarDateChange}
              />
            )}
          </View>
        )}

        {/* Input cho Âm lịch */}
        {calendarType === 'lunar' && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Ngày Âm Lịch:</Text>
            <View style={styles.lunarInputGroup}>
              <TextInput
                label="Ngày"
                value={lunarDay}
                onChangeText={setLunarDay}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.lunarInput, { flex: 1 }]} 
                theme={{ colors: { primary: theme.colors.primary, outline: theme.colors.outline } }}
              />
              <TextInput
                label="Tháng"
                value={lunarMonth}
                onChangeText={setLunarMonth}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.lunarInput, { flex: 1, marginLeft: 10 }]} 
                theme={{ colors: { primary: theme.colors.primary, outline: theme.colors.outline } }}
              />
            </View>
            <View style={styles.checkboxItem}>
              <Checkbox.Android
                status={isLeapMonth ? 'checked' : 'unchecked'}
                onPress={() => setIsLeapMonth(!isLeapMonth)}
                color={theme.colors.primary}
              />
              <Text style={{ color: theme.colors.onSurface }}>Tháng nhuận</Text>
            </View>
          </View>
        )}

        <Divider style={styles.divider} />

        {/* Lặp hàng năm */}
        <View style={styles.checkboxItem}>
          <Checkbox.Android
            status={repeatAnnually ? 'checked' : 'unchecked'}
            onPress={() => setRepeatAnnually(!repeatAnnually)}
            color={theme.colors.primary}
          />
          <Text style={{ color: theme.colors.onSurface }}>Lặp hàng năm</Text>
        </View>

        <Divider style={styles.divider} />

        {/* Preview */}
        <View style={[styles.previewContainer, { borderColor: theme.colors.outline }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Preview:</Text>
          {renderPreview()}
        </View>

        <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
          Lưu Sự Kiện
        </Button>
      </ScrollView>
    </View>
  );
};

export default EventFormScreen;