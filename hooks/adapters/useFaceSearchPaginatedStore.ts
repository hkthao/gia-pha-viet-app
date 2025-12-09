import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFaceStore, FaceStore } from '@/stores/useFaceStore'; // Import FaceStore type
import { DetectedFaceDto, SearchFacesQuery } from '@/types';

export function useFaceSearchPaginatedStore(currentFamilyId: string | null) {
  const { t } = useTranslation();

  const items = useFaceStore((state: FaceStore) => state.items);
  const loading = useFaceStore((state: FaceStore) => state.loading);
  const error = useFaceStore((state: FaceStore) => state.error);
  const hasMore = useFaceStore((state: FaceStore) => state.hasMore);
  const page = useFaceStore((state: FaceStore) => state.page);

  // Extract stable actions directly
  const searchAction = useFaceStore((state: FaceStore) => state.search);
  const resetAction = useFaceStore((state: FaceStore) => state.reset);
  const setErrorAction = useFaceStore((state: FaceStore) => state.setError);

  // Memoize the refresh and loadMore functions using useCallback to ensure their stability
  const refresh = useCallback(
    async (query: SearchFacesQuery) => {
      if (!currentFamilyId) {
        setErrorAction(t('faceSearch.noFamilyIdSelected')); // Assuming this key exists
        return null;
      }
      const newQuery: SearchFacesQuery = {
        ...query,
        familyId: currentFamilyId,
        page: 1,
      };
      return searchAction(newQuery, true);
    },
    [currentFamilyId, t, searchAction, setErrorAction]
  );

  const loadMore = useCallback(
    async (query: SearchFacesQuery) => {
      if (!currentFamilyId) {
        setErrorAction(t('faceSearch.noFamilyIdSelected')); // Assuming this key exists
        return null;
      }
      const newQuery: SearchFacesQuery = {
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
