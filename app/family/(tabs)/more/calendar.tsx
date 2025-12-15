import React, { useMemo } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Appbar, useTheme, Text, IconButton, Divider } from 'react-native-paper';
import { Calendar, DateData } from 'react-native-calendars';
import { DayProps } from 'react-native-calendars/src/calendar/day';
import { DayCell, EventListItem } from '@/components/event';
import { useRouter } from 'expo-router';
import { useFamilyCalendar } from '@/hooks/calendar/useFamilyCalendar'; // Import the new hook
import { SPACING_LARGE, SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';

const FamilyCalendarScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();

  const {
    t,
    i18n,
    selectedDate,
    filteredEvents, // Use filteredEvents
    allEventsInCalendar, // Use allEventsInCalendar for overall events for rendering in the FlatList
    mockData,
    handleDayPress,
    handleAddEvent,
    clearFilter, // Import clearFilter
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

        <Divider style={{
          margin: SPACING_MEDIUM,
        }} />

        <View style={styles.eventListTitleContainer}>
          <Text variant="titleMedium" style={styles.eventListTitle}>
            {selectedDate ? `${t('calendar.eventsFor')} ${selectedDate}` : t('calendar.allEvents')}
          </Text>
          {selectedDate && (
            <IconButton
              icon="filter-remove-outline"
              onPress={clearFilter}
              iconColor={theme.colors.onSurfaceVariant}
              size={20}
              style={styles.clearFilterButton}
            />
          )}
        </View>
        <FlatList
          data={selectedDate ? filteredEvents : allEventsInCalendar} // Use filteredEvents if a date is selected, otherwise show allEventsInCalendar
          renderItem={renderEventListItem}
          keyExtractor={(item, index) => item.date + item.name + index}
          ListEmptyComponent={
            <Text style={[styles.emptyListText, { color: theme.colors.onSurfaceVariant }]}>
              {selectedDate ? t('calendar.noEventsForSelectedDate') : t('calendar.noEvents')}
            </Text>
          }
        />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendar: {
  },
  eventListContainer: {
    flex: 1,
    paddingTop: SPACING_SMALL,
  },
  eventListTitle: {
    fontWeight: 'bold',
    paddingHorizontal: SPACING_SMALL,
  },
  eventListTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING_MEDIUM,
    marginBottom: SPACING_MEDIUM,
  },
  clearFilterButton: {
    margin: -8, // Adjust as needed for alignment
  },
  emptyListText: {
    paddingHorizontal: SPACING_MEDIUM,
    textAlign: 'center',
    marginTop: SPACING_LARGE,
  },
});

export default FamilyCalendarScreen;
