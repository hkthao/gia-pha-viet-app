import React, { useMemo, useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, ScrollView } from 'react-native';
import { Appbar, useTheme, Text, IconButton, Divider } from 'react-native-paper';
import { Calendar, DateData } from 'react-native-calendars';
import { DayProps } from 'react-native-calendars/src/calendar/day';
import { DayCell, EventListItem } from '@/components/event';
import { useRouter } from 'expo-router';
import { useFamilyCalendar } from '@/hooks/calendar/useFamilyCalendar'; // Import the new hook
import { SPACING_LARGE, SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import dayjs from 'dayjs';

const FamilyCalendarScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const [currentViewYear, setCurrentViewYear] = useState(dayjs().year());
  const [currentViewMonth, setCurrentViewMonth] = useState(dayjs().month() + 1); // dayjs months are 0-indexed

  const startDate = useMemo(() => dayjs().year(currentViewYear).month(currentViewMonth - 1).startOf('month').format('YYYY-MM-DD'), [currentViewYear, currentViewMonth]);
  const endDate = useMemo(() => dayjs().year(currentViewYear).month(currentViewMonth - 1).endOf('month').format('YYYY-MM-DD'), [currentViewYear, currentViewMonth]);

  const {
    t,
    selectedDate,
    filteredEvents,
    allEventsInCalendar,
    processedCalendarData, // Use processedCalendarData
    handleDayPress,
    handleAddEvent,
    clearFilter,
    isLoading, // Destructure isLoading
    isError, // Destructure isError
    error, // Destructure error
    refetch, // Destructure refetch for pull-to-refresh
  } = useFamilyCalendar(currentViewYear, startDate, endDate);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const renderDay = (props: DayProps & { date?: DateData }) => {
    if (!props.date) {
      return null;
    }
    const date = props.date;
    const dateString = date.dateString;
    const dayData = processedCalendarData[dateString]; // Use processedCalendarData
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

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    calendar: {
    },
    eventListContainer: {
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING_MEDIUM,
    },
  }), [theme]);

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="titleMedium" style={{ color: theme.colors.error }}>{error?.message || t('common.error_occurred')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('calendar.title')} titleStyle={{ color: theme.colors.onSurface }} />
        <Appbar.Action
          icon="plus"
          onPress={() => handleAddEvent(selectedDate || new Date().toISOString().split('T')[0])}
          color={theme.colors.primary}
        />
      </Appbar.Header>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]} // Customize refresh indicator color
            tintColor={theme.colors.primary} // For iOS
          />
        }
      >
        <Calendar
          monthFormat={'MMMM yyyy'}
          hideArrows={false}
          onDayPress={(day) => handleDayPress(day.dateString)}
          onMonthChange={(month) => {
            setCurrentViewYear(month.year);
            setCurrentViewMonth(month.month);
            clearFilter(); // Clear selected date and filtered events when month changes
          }}
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
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

    </View>
  );
};

export default FamilyCalendarScreen;
