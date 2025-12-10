import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useEventStore, EventStore } from '@/stores/useEventStore'; // Import EventStore type
import { EventDto, SearchEventsQuery } from '@/types';

export function useEventSearchPaginatedStore(currentFamilyId: string | null) {
  const { t } = useTranslation();

  const items = useEventStore((state: EventStore) => state.items);
  const loading = useEventStore((state: EventStore) => state.loading);
  const error = useEventStore((state: EventStore) => state.error);
  const hasMore = useEventStore((state: EventStore) => state.hasMore);
  const page = useEventStore((state: EventStore) => state.page);

  // Extract stable actions directly
  const searchAction = useEventStore((state: EventStore) => state.search);
  const resetAction = useEventStore((state: EventStore) => state.reset);
  const setErrorAction = useEventStore((state: EventStore) => state.setError);

  // Memoize the refresh and loadMore functions using useCallback to ensure their stability
  const refresh = useCallback(
    async (query: SearchEventsQuery) => {
      if (!currentFamilyId) {
        setErrorAction(t('timeline.familyIdNotFound'));
        return null;
      }
      const newQuery: SearchEventsQuery = {
        ...query,
        familyId: currentFamilyId,
        page: 1,
      };
      return searchAction(newQuery, true);
    },
    [currentFamilyId, t, searchAction, setErrorAction]
  );

  const loadMore = useCallback(
    async (query: SearchEventsQuery) => {
      if (!currentFamilyId) {
        setErrorAction(t('timeline.familyIdNotFound'));
        return null;
      }
      const newQuery: SearchEventsQuery = {
        ...query,
        familyId: currentFamilyId,
        page: page + 1,
      };
      return searchAction(newQuery, false);
    },
    [currentFamilyId, page, t, searchAction, setErrorAction]
  );

  const mappedStore = useMemo(() => ({
    items: items,
    loading,
    error,
    hasMore,
    page,
    refresh,
    loadMore,
    reset: resetAction,
    setError: setErrorAction,
  }), [items, loading, error, hasMore, page, refresh, loadMore, resetAction, setErrorAction]);

  return mappedStore;
}