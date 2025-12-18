import { useState, useMemo, useCallback } from 'react';
import { LocaleConfig } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { CalendarType, EventDto, EventType, PaginatedList, SearchEventsQuery } from '@/types'; // Import EventDto and PaginatedList
import { useQuery } from '@tanstack/react-query'; // Import useQuery and QueryKey
import { eventService } from '@/services'; // Import eventService
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore'; // Import useCurrentFamilyStore
import dayjs from 'dayjs'; // Import dayjs for date manipulation
import { Solar, Lunar } from 'lunar-javascript';
interface EventData {
  type: EventType;
  color?: string;
  name: string;
  date: string; // Solar date string (YYYY-MM-DD)
  lunarText?: string;
  id: string;
}
interface CalendarDayData {
  lunarText?: string;
  events?: Omit<EventData, 'date' | 'lunarText'>[];
}
interface ProcessedCalendarData {
  [dateString: string]: CalendarDayData;
}
// Local type for calendar-specific event search query, making familyId mandatory
interface CalendarSearchEventsQuery extends SearchEventsQuery {
  familyId: string;
}
export const useFamilyCalendar = (currentViewYear: number, startDate: string, endDate: string) => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const currentFamilyId = useCurrentFamilyStore((state) => state.currentFamilyId);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filteredEvents, setFilteredEvents] = useState<EventData[]>([]);

  // Configure react-native-calendars locale based on i18n language
  useMemo(() => {
    if (i18n.language === 'vi') {
      LocaleConfig.locales['vi'] = {
        monthNames: [
          'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
          'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
        ],
        monthNamesShort: [
          'Thg1', 'Thg2', 'Thg3', 'Thg4', 'Thg5', 'Thg6',
          'Thg7', 'Thg8', 'Thg9', 'Thg10', 'Thg11', 'Thg12',
        ],
        dayNames: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
        dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        today: 'Hôm nay',
      };
      LocaleConfig.defaultLocale = 'vi';
    } else {
      LocaleConfig.locales['en'] = {
        monthNames: [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December',
        ],
        monthNamesShort: [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
        ],
        dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        today: 'Today',
      };
      LocaleConfig.defaultLocale = 'en';
    }
  }, [i18n.language]);
  const getLunarDate = useCallback((solarDateString: string) => {
    const [year, month, day] = solarDateString.split('-').map(Number);
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    if (lunar && lunar.lDay && lunar.lMonth) {
      return `${lunar.lDay}/${lunar.lMonth}`;
    }
    return '';
  }, []);
  // Use react-query to fetch events for the current family
  const { data: eventsData, isLoading, isError, error, refetch } = useQuery<PaginatedList<EventDto>, Error, EventDto[]>({
    queryKey: ['familyEvents', currentFamilyId, currentViewYear, startDate, endDate],
    queryFn: async ({ queryKey }): Promise<PaginatedList<EventDto>> => { // Explicitly define queryFn return type
      const [familyId, year, queryStartDate, queryEndDate] = queryKey;
      if (!familyId) {
        throw new Error(t('calendar.errors.noFamilyId'));
      }
      const startSolar = Solar.fromYmd(dayjs(startDate).year(), dayjs(startDate).month() + 1, dayjs(startDate).date());
      const endSolar = Solar.fromYmd(dayjs(endDate).year(), dayjs(endDate).month() + 1, dayjs(endDate).date());
      const startLunar = startSolar.getLunar();
      const endLunar = endSolar.getLunar();
      const lunarStartDay = 1;
      const lunarStartMonth = startLunar.getMonth();
      let lunarEndDay = endLunar.getDay();
      const lunarEndMonth = endLunar.getMonth();
      if (lunarEndMonth > lunarStartMonth) {
        lunarEndDay = 30;
      }

      const query = {
        familyId: familyId,
        startDate: queryStartDate as string,
        endDate: queryEndDate as string,
        lunarStartDay: lunarStartDay,
        lunarStartMonth: lunarStartMonth,
        lunarEndDay: lunarEndDay,
        lunarEndMonth: lunarEndMonth,
      } as CalendarSearchEventsQuery;

      const result = await eventService.search(query);
      if (result.isSuccess && result.value) {
        result.value.items = result.value.items.map(event => {
          // Transform lunar events to solar dates
          if (event.calendarType === CalendarType.LUNAR && event.lunarDate?.month && event.lunarDate?.day) {
            const lunarDate = Lunar.fromYmd(year as number, event.lunarDate.month, event.lunarDate.day);
            const solarDate = lunarDate.getSolar();
            event.solarDate = dayjs(`${solarDate.getYear()}-${solarDate.getMonth()}-${solarDate.getDay()}`).toDate();
          }
          return event;
        });
        return result.value; // Return the full PaginatedList with transformed dates
      }
      throw new Error(result.error?.message || t('calendar.errors.fetchEvents'));
    },
    enabled: !!currentFamilyId && !!startDate && !!endDate,
    select: (data) => data.items || [], // Extract items from PaginatedList
  });
  const allEventsInCalendar: EventData[] = useMemo(() => {
    return (eventsData || []).map(event => ({
      type: event.type,
      color: event.color,
      name: event.name,
      date: dayjs(event.solarDate).format('YYYY-MM-DD'), // Assuming startDate is solar date
      lunarText: event.calendarType === CalendarType.LUNAR && event.lunarDate?.day && event.lunarDate?.month
        ? `${event.lunarDate.day}/${event.lunarDate.month}`
        : getLunarDate(dayjs(event.solarDate).format('YYYY-MM-DD')),
      id: event.id,
    }));
  }, [eventsData, getLunarDate]);
  const processedCalendarData: ProcessedCalendarData = useMemo(() => {
    const data: ProcessedCalendarData = {};
    allEventsInCalendar.forEach(event => {
      const dateString = event.date;
      if (!data[dateString]) {
        data[dateString] = { lunarText: event.lunarText, events: [] };
      }
      data[dateString].events?.push({
        id: event.id,
        type: event.type,
        color: event.color,
        name: event.name,
      });
    });
    return data;
  }, [allEventsInCalendar]);
  const handleDayPress = useCallback((dateString: string) => {
    setSelectedDate(dateString);
    setFilteredEvents(allEventsInCalendar.filter(event => event.date === dateString));
  }, [allEventsInCalendar]);
  const handleAddEvent = useCallback((date: string) => {
    router.push(`/event/create?date=${date}`);
  }, [router]);
  const clearFilter = useCallback(() => {
    setSelectedDate('');
    setFilteredEvents([]); // Clear filtered events
  }, []);
  return {
    t,
    i18n,
    selectedDate,
    allEventsInCalendar,
    filteredEvents,
    processedCalendarData, // Provide processed data for renderDay
    handleDayPress,
    handleAddEvent,
    clearFilter,
    isLoading,
    isError,
    error,
    refetch,
  };
};
