import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { AgendaEntry, AgendaSchedule, DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';
import { useEventStore } from '@/stores/useEventStore';
import { useCurrentFamilyId } from '@/hooks/family/useCurrentFamilyId';
import type { EventDto, EventType } from '@/types';
import { debounce } from '@/utils/debounce';
import { Alert } from 'react-native'; // Import Alert for error handling

interface EventItem extends AgendaEntry {
  id: string;
  name: string;
  height: number;
  day: string;
  type: EventType;
}

export interface UseFamilyAgendaEventsResult {
  items: AgendaSchedule;
  markedDates: { [key: string]: { marked: boolean } };
  loadItemsForMonth: (day: DateData) => Promise<void>;
  error: string | null;
  timeToString: (time: number) => string;
  getDayName: (dateString: string) => string;
  rowHasChanged: (r1: AgendaEntry, r2: AgendaEntry) => boolean;
}

export function useFamilyAgendaEvents(): UseFamilyAgendaEventsResult {
  const [items, setItems] = useState<AgendaSchedule>({});
  const [markedDates, setMarkedDates] = useState<{ [key: string]: { marked: boolean } }>({});
  const { t } = useTranslation();

  const currentFamilyId = useCurrentFamilyId();
  const { error, search } = useEventStore();
  const [loadedMonths, setLoadedMonths] = useState<Set<string>>(new Set());
  const loadedMonthsRef = useRef(loadedMonths);

  useEffect(() => {
    loadedMonthsRef.current = loadedMonths;
  }, [loadedMonths]);

  useEffect(() => {
    const updatedMarkedDates: { [key: string]: { marked: boolean } } = {};
    Object.keys(items).forEach(date => {
      if (items[date] && items[date].length > 0) {
        updatedMarkedDates[date] = { marked: true };
      }
    });
    setMarkedDates(updatedMarkedDates);
  }, [items]);

  const timeToString = useCallback((time: number) => {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
  }, []);

  const getDayName = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    return new Intl.DateTimeFormat('vi-VN', options).format(date);
  }, []);

  const loadItems = useMemo(() => debounce(async (day: DateData) => {
    if (!currentFamilyId) {
      // Handle the case where familyId is not available, maybe show an alert or a message
      Alert.alert(t('common.error'), t('timeline.familyIdNotFound'));
      return;
    }

    const monthString = new Date(day.timestamp).toISOString().slice(0, 7); // YYYY-MM
    if (loadedMonthsRef.current.has(monthString)) {
      return; // Already loaded for this month
    }

    const startDate = timeToString(day.timestamp);
    const endDate = timeToString(day.timestamp + (30 * 24 * 60 * 60 * 1000)); // Load for a month

    const fetchedPaginatedEvents = await search({
      familyId: currentFamilyId,
      startDate,
      endDate,
      page: 1,
      itemsPerPage: 100,
      sortBy :"startDate"
    });

    if (fetchedPaginatedEvents) {
      setLoadedMonths(prev => new Set(prev).add(monthString)); // Mark month as loaded
    }

    setItems((prevItems) => {
      const mergedItems = { ...prevItems };
      fetchedPaginatedEvents?.items?.forEach((event: EventDto) => {
        const eventDate = timeToString(new Date(event.startDate).getTime());
        if (!mergedItems[eventDate]) {
          mergedItems[eventDate] = [];
        }
        // Check for duplicates before adding
        if (!(mergedItems[eventDate] as EventItem[]).some(item => item.id === event.id)) {
          mergedItems[eventDate].push({
            id: event.id,
            name: event.name || t('eventDetail.noTitle'),
            height: 80, // Fixed height for now, can be dynamic
            day: eventDate,
            type: event.type,
          } as EventItem);
        }
      });
      return mergedItems;
    });
  }, 300), [currentFamilyId, search, t, timeToString]);

  const rowHasChanged = useCallback((r1: AgendaEntry, r2: AgendaEntry) => {
    return r1.name !== r2.name;
  }, []);

  return {
    items,
    markedDates,
    loadItemsForMonth: loadItems,
    error,
    timeToString,
    getDayName,
    rowHasChanged,
  };
}