import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { AgendaEntry, AgendaSchedule, DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';

import { useCurrentFamilyId } from '@/hooks/family/useCurrentFamilyId';
import type { EventDto, EventType, SearchEventsQuery } from '@/types';
import { debounce } from '@/utils/debounce';
import { Alert } from 'react-native';
import { useSearchEventsQuery } from '@/hooks/event/useEventsQuery';

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
  timeToString: (time: number) => string;
  getDayName: (dateString: string) => string;
  rowHasChanged: (r1: AgendaEntry, r2: AgendaEntry) => boolean;
}

export function useFamilyAgendaEvents(): UseFamilyAgendaEventsResult {
  const [items, setItems] = useState<AgendaSchedule>({});
  const [markedDates, setMarkedDates] = useState<{ [key: string]: { marked: boolean } }>({});
  const { t } = useTranslation();

  const currentFamilyId = useCurrentFamilyId();
  const [searchFilters, setSearchFilters] = useState<SearchEventsQuery>({ familyId: currentFamilyId || '', page: 1, itemsPerPage: 100, sortBy: 'startDate' });
  const { data: fetchedEventsData } = useSearchEventsQuery(searchFilters);

  const [loadedMonths, setLoadedMonths] = useState<Set<string>>(new Set());
  const loadedMonthsRef = useRef(loadedMonths);

  const timeToString = useCallback((time: number) => {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
  }, []);

  const getDayName = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    return new Intl.DateTimeFormat('vi-VN', options).format(date);
  }, []);

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

  useEffect(() => {
    if (fetchedEventsData) {
      setItems((prevItems) => {
        const mergedItems = { ...prevItems };
        fetchedEventsData.forEach((event: EventDto) => {
          const eventDate = event.solarDate ? timeToString(new Date(event.solarDate).getTime()) : '';
          if (eventDate) {
            if (!mergedItems[eventDate]) {
              mergedItems[eventDate] = [];
            }
            if (!(mergedItems[eventDate] as EventItem[]).some(item => item.id === event.id)) {
              mergedItems[eventDate].push({
                id: event.id,
                name: event.name || t('eventDetail.noTitle'),
                height: 80,
                day: eventDate,
                type: event.type,
              } as EventItem);
            }
          }
        });
        return mergedItems;
      });
    }
  }, [fetchedEventsData, t, timeToString]);


  const fetchAndProcessEvents = useCallback(async (day: DateData) => {
    if (!currentFamilyId) {
      Alert.alert(t('common.error'), t('timeline.familyIdNotFound'));
      return;
    }

    const monthString = new Date(day.timestamp).toISOString().slice(0, 7);
    if (loadedMonthsRef.current.has(monthString)) {
      return;
    }

    const startDate = timeToString(day.timestamp);
    const endDate = timeToString(day.timestamp + (30 * 24 * 60 * 60 * 1000));

    setSearchFilters(prev => ({
      ...prev,
      familyId: currentFamilyId,
      startDate,
      endDate,
    }));

    setLoadedMonths(prev => new Set(prev).add(monthString));
  }, [currentFamilyId, t, timeToString]);

  const loadItems = useMemo(() => debounce(fetchAndProcessEvents, 300), [fetchAndProcessEvents]);

  const rowHasChanged = useCallback((r1: AgendaEntry, r2: AgendaEntry) => {
    return r1.name !== r2.name;
  }, []);

  return {
    items,
    markedDates,
    loadItemsForMonth: loadItems,
    timeToString,
    getDayName,
    rowHasChanged,
  };
}