import { useState, useMemo, useCallback } from 'react';
import { DateData, LocaleConfig } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { EventType } from '@/types';

interface EventData {
  type: EventType;
  color?: string;
  name: string;
  date: string;
  lunarText?: string;
  id: string;
}

interface CalendarDayData {
  lunarText?: string;
  events?: Omit<EventData, 'date' | 'lunarText'>[];
}

interface MockCalendarData {
  [key: string]: CalendarDayData;
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

export const useFamilyCalendar = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
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

  // Aggregate all events from mockData
  const allEventsInCalendar: EventData[] = useMemo(() => {
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
    mockData, // Keep mockData available for renderDay
    handleDayPress,
    handleAddEvent,
    clearFilter,
  };
};
