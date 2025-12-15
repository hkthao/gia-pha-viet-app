import React, { useMemo } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Appbar, useTheme, Text } from 'react-native-paper';
import { Calendar, DateData } from 'react-native-calendars';
import { DayProps } from 'react-native-calendars/src/calendar/day';
import { DayCell, EventBottomSheet, EventListItem } from '@/components/event';
import { useRouter } from 'expo-router';
import { useFamilyCalendar } from '@/hooks/calendar/useFamilyCalendar'; // Import the new hook

const FamilyCalendarScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  
  const {
    t,
    i18n,
    selectedDate,
    showBottomSheet,
    setShowBottomSheet,
    selectedDayEvents,
    selectedDayLunarText,
    allEvents,
    mockData,
    handleDayPress,
    handleAddEvent,
  } = useFamilyCalendar();

  const renderDay = (props: DayProps & { date?: DateData }) => {
    if (!props.date) {
      return null;
    }
    const date = props.date;
    const dateString = date.dateString;
    const dayData = mockData[dateString];
    const isToday = date.dateString === new Date().toISOString().split('T')[0];

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

  const renderEventListItem = ({ item }: { item: any }) => (
    <EventListItem event={item} onPress={(eventId) => router.push(`/event/${eventId}`)} />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.Content title={t('calendar.title')} titleStyle={{ color: theme.colors.onSurface }} />
        <Appbar.Action
          icon="plus"
          onPress={() => handleAddEvent(selectedDate || new Date().toISOString().split('T')[0])}
          color={theme.colors.primary}
        />
      </Appbar.Header>

      <Calendar
        monthFormat={'MMMM yyyy'}
        hideArrows={false}
        onDayPress={(day) => handleDayPress(day.dateString)}
        hideExtraDays={true}
        dayComponent={renderDay}
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
          textDayFontFamily: 'Roboto',
          textMonthFontFamily: 'Roboto',
          textDayHeaderFontFamily: 'Roboto',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14,
        }}
        style={styles.calendar}
      />

      <View style={styles.eventListContainer}>
        <Text variant="titleMedium" style={styles.eventListTitle}>
          {t('calendar.allEvents')}
        </Text>
        <FlatList
          data={allEvents}
          renderItem={renderEventListItem}
          keyExtractor={(item, index) => item.date + item.name + index}
          ListEmptyComponent={
            <Text style={[styles.emptyListText, { color: theme.colors.onSurfaceVariant }]}>
              {t('calendar.noEvents')}
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
    flex: 1,
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

export default FamilyCalendarScreen;
