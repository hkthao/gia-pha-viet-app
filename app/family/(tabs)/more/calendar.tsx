import React, { useState, useMemo } from 'react'; // Added useMemo
import { StyleSheet, View, FlatList } from 'react-native'; // Added FlatList
import { Appbar, useTheme, Text } from 'react-native-paper'; // Added Text
import { Calendar, DateData } from 'react-native-calendars';
import { DayProps } from 'react-native-calendars/src/calendar/day'; // Import DayProps from its specific path
import { DayCell, EventBottomSheet, EventListItem } from '@/components/event'; // Added EventListItem
import { useRouter } from 'expo-router'; // Import useRouter
import { EventType } from '@/types'; // Import EventType

interface EventData {
  type: EventType;
  color?: string;
  name: string;
  date: string; // Thêm trường date (solarDate)
  lunarText?: string; // Thêm trường lunarText
  id: string; // Add event ID
}

interface CalendarDayData {
  lunarText?: string;
  // events trong mockData bây giờ sẽ chứa id
  events?: Omit<EventData, 'date' | 'lunarText'>[];
}

interface MockCalendarData {
  [key: string]: CalendarDayData; // Index signature
}

// Giả lập dữ liệu sự kiện và lịch âm từ backend
// Trong thực tế, dữ liệu này sẽ được lấy từ API
const mockData: MockCalendarData = {
  '2025-12-15': { lunarText: '14/11', events: [{ id: 'evt1', type: EventType.Anniversary, color: '#FFD700', name: 'Sinh nhật ông A' }] },
  '2025-12-16': { lunarText: '15/11', events: [{ id: 'evt2', type: EventType.Death, color: '#8B0000', name: 'Giỗ bà B' }, { id: 'evt3', type: EventType.Other, color: '#0000FF', name: 'Họp mặt gia đình' }] },
  '2025-12-25': { lunarText: '24/11', events: [{ id: 'evt4', type: EventType.Other, color: '#008000', name: 'Ngày lễ Giáng Sinh' }] },
  '2026-01-01': { lunarText: '3/12', events: [{ id: 'evt5', type: EventType.Other, color: '#FFA500', name: 'Tết Dương Lịch' }] },
  '2025-12-10': { lunarText: '9/11' }, // Ngày không có sự kiện
};

const CalendarScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter(); // Initialize router
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showBottomSheet, setShowBottomSheet] = useState<boolean>(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<any[]>([]);
  const [selectedDayLunarText, setSelectedDayLunarText] = useState<string | undefined>(undefined);

  // Aggregate all events from mockData
  const allEvents: EventData[] = useMemo(() => {
    const eventsList: EventData[] = [];
    Object.keys(mockData).forEach(dateString => {
      const dayData = mockData[dateString];
      dayData.events?.forEach(event => {
        eventsList.push({
          ...event,
          date: dateString,
          lunarText: dayData.lunarText,
        });
      });
    });
    // Sort events by date
    return eventsList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [mockData]); // Re-calculate if mockData changes

  const handleDayPress = (dateString: string) => {
    setSelectedDate(dateString);
    // Filter events for the selected day from the aggregated list
    setSelectedDayEvents(allEvents.filter(event => event.date === dateString));
    setSelectedDayLunarText(mockData[dateString]?.lunarText); // Still get lunar text from mockData
    setShowBottomSheet(true);
  };

  const handleAddEvent = (date: string) => {
    setShowBottomSheet(false);
    // TODO: Navigate to EventFormScreen with pre-filled date
    console.log(`Add event for date: ${date}`);
    router.push(`/event/create?date=${date}`);
  };

  const renderDay = (props: DayProps & { date?: DateData }) => {
    if (!props.date) {
      // Nếu không có date, trả về null hoặc một DayCell rỗng
      return null;
    }
    const date = props.date;
    const dateString = date.dateString;
    const dayData = mockData[dateString];
    const isToday = date.dateString === new Date().toISOString().split('T')[0]; // Kiểm tra ngày hiện tại

    return (
      <DayCell
        solarDate={dateString}
        solarDay={date.day}
        lunarText={dayData?.lunarText}
        events={dayData?.events}
        isToday={isToday}
        onPress={handleDayPress}
      />
    );
  };

  const renderEventListItem = ({ item }: { item: EventData }) => (
    <EventListItem event={item} onPress={(eventId) => router.push(`/event/${eventId}`)} />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.Content title="Lịch Sự Kiện" titleStyle={{ color: theme.colors.onSurface }} />
        <Appbar.Action
          icon="plus" // Icon cho nút thêm sự kiện
          onPress={() => handleAddEvent(selectedDate || new Date().toISOString().split('T')[0])} // Mở form thêm sự kiện
          color={theme.colors.primary}
        />
      </Appbar.Header>

      <Calendar
        // Định dạng header để hiển thị tháng và năm
        monthFormat={'MMMM yyyy'}
        // Hide arrows if you don't want them
        hideArrows={false}
        // DisabledByDefault={true}
        // Callback that gets called on day press
        onDayPress={(day) => handleDayPress(day.dateString)}
        // Do not show days of other months in the calendar
        hideExtraDays={true}
        // Replace default day component with custom one
        dayComponent={renderDay}
        // Custom theme for calendar (optional, can be fully customized via Paper theme)
        theme={{
          backgroundColor: theme.colors.background,
          calendarBackground: theme.colors.background,
          textSectionTitleColor: theme.colors.onSurface,
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: theme.colors.onPrimary,
          todayTextColor: theme.colors.primary,
          dayTextColor: theme.colors.onSurface,
          textDisabledColor: theme.colors.onSurfaceDisabled,
          dotColor: theme.colors.primary,
          selectedDotColor: theme.colors.onPrimary,
          arrowColor: theme.colors.primary,
          monthTextColor: theme.colors.onSurface,
          textDayFontFamily: 'Roboto', // Sử dụng font mặc định của Paper
          textMonthFontFamily: 'Roboto',
          textDayHeaderFontFamily: 'Roboto',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14,
        }}
        // Style for the calendar container (optional)
        style={styles.calendar}
      />

      {/* FlatList để hiển thị danh sách tất cả sự kiện */}
      <View style={styles.eventListContainer}>
        <Text variant="titleMedium" style={styles.eventListTitle}>
          Tất cả Sự kiện
        </Text>
        <FlatList
          data={allEvents}
          renderItem={renderEventListItem}
          keyExtractor={(item, index) => item.date + item.name + index} // Unique key
          ListEmptyComponent={
            <Text style={[styles.emptyListText, { color: theme.colors.onSurfaceVariant }]}>
              Không có sự kiện nào.
            </Text>
          }
        />
      </View>

      <EventBottomSheet
        visible={showBottomSheet}
        onDismiss={() => setShowBottomSheet(false)}
        solarDate={selectedDate}
        lunarText={selectedDayLunarText}
        events={selectedDayEvents}
        onAddEvent={handleAddEvent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  eventListContainer: {
    flex: 1, // Take remaining space
    paddingTop: 8,
  },
  eventListTitle: {
    paddingHorizontal: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptyListText: {
    paddingHorizontal: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CalendarScreen;