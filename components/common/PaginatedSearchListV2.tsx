import React from 'react';
import { FlatList, View, RefreshControl, StyleProp, ViewStyle } from 'react-native';
import { Searchbar, Text, IconButton as PaperIconButton } from 'react-native-paper';
import { usePaginatedSearchListUI } from '@/hooks/search/usePaginatedSearchListUI';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import type { PaginatedList } from '@/types/common';
import { useInfiniteQuery, QueryKey, InfiniteData } from '@tanstack/react-query';

interface PaginatedSearchListV2Props<T, Q extends { searchQuery?: string }> {
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  ListEmptyComponent?: React.ComponentType | React.ReactElement | null;
  ListHeaderComponent?: React.ComponentType | React.ReactElement | null;
  FilterComponent?: React.ComponentType<{ filters: Q; setFilters: React.Dispatch<React.SetStateAction<Q>>; toggleFilterVisibility?: () => void; }>;
  headerTitle?: string;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  searchbarContainerStyle?: StyleProp<ViewStyle>;
  showFilterButton?: boolean;

  queryKey: (filters: Q) => QueryKey;
  queryFn: ({ pageParam, queryKey, filters }: { pageParam?: number; queryKey: QueryKey; filters: Q }) => Promise<PaginatedList<T>>;
  initialFilters: Q;
  itemsPerPage?: number;
  externalDependencies?: React.DependencyList;
  selectData?: (data: InfiniteData<PaginatedList<T>>) => T[];
}


export function PaginatedSearchListV2<T, Q extends { searchQuery?: string }>(
  props: PaginatedSearchListV2Props<T, Q>
) {
  const {
    renderItem,
    keyExtractor,
    ListEmptyComponent,
    FilterComponent,
    headerTitle,
    containerStyle,
    contentContainerStyle,
    searchbarContainerStyle,
    showFilterButton = false,

    queryKey: getQueryKey, // Renamed to avoid conflict with react-query's queryKey in options
    queryFn,
    initialFilters,
    itemsPerPage = 10,
    externalDependencies = [],
    selectData,
  } = props;

  // Local state for search query and filters, replaces Zustand store's filter
  const [searchQuery, setSearchQuery] = React.useState(initialFilters.searchQuery || '');
  const [filters, setFilters] = React.useState<Q>(initialFilters);

  // Use a debounced search query to prevent excessive API calls
  const debouncedSearchQuery = React.useDeferredValue(searchQuery);

  // Combine filters and search query for the effective query
  const effectiveFilters = React.useMemo(() => ({
    ...filters,
    searchQuery: debouncedSearchQuery,
    page: 1, // Reset page when filters or search query changes
    itemsPerPage,
  }), [filters, debouncedSearchQuery, itemsPerPage]);

  const currentQueryKey = React.useMemo(() => [ ...getQueryKey(effectiveFilters), ...externalDependencies ], [getQueryKey, effectiveFilters, externalDependencies]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useInfiniteQuery<PaginatedList<T>, Error, InfiniteData<PaginatedList<T>>, QueryKey, number>({
    queryKey: currentQueryKey,
    queryFn: ({ pageParam = 1, queryKey: reactQueryKey }) =>
      queryFn({ pageParam, queryKey: reactQueryKey, filters: effectiveFilters }),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage <= lastPage.totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
    enabled: true, // Always enable, as initialFilters should make it ready
    queryKeyHashFn: (queryKey) => JSON.stringify(queryKey), // Custom hash function for complex query keys
    // staleTime: 1000 * 60 * 5, // 5 minutes
    // cacheTime: 1000 * 60 * 10, // 10 minutes
  });

  const items: T[] = React.useMemo(() => {
    if (selectData && data) {
      return selectData(data);
    }
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data, selectData]);

  const loading = isLoading || isFetchingNextPage;
  const refreshing = isRefetching && !isLoading; // Distinguish between initial load and refetching

  const handleRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLoadMore = React.useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);


  const {
    showFilterUI,
    toggleFilterVisibility,
    styles,
    EmptyComponent,
    FooterComponent,
    searchPlaceholder: uiSearchPlaceholder, // Renamed to avoid conflict
    theme,
  } = usePaginatedSearchListUI({
    ListEmptyComponent,
    loading,
    refreshing,
    itemsLength: items.length,
    hasMore: !!hasNextPage,
    searchPlaceholder: props.searchPlaceholder,
    error: error?.message,
  });

  // Memoized styles for performance
  const safeAreaCombinedStyle = React.useMemo(
    () => [styles.safeArea, containerStyle],
    [styles.safeArea, containerStyle]
  );

  const containerCombinedStyle = React.useMemo(
    () => [styles.container, containerStyle],
    [styles.container, containerStyle]
  ); 

  const flatListContentCombinedStyle = React.useMemo(
    () => [styles.container, contentContainerStyle],
    [styles.container, contentContainerStyle]
  );

  const handleClearSearch = React.useCallback(() => setSearchQuery(''), [setSearchQuery]);

  return (
    <View style={safeAreaCombinedStyle}>
      {headerTitle && (
        <View style={{ paddingHorizontal: SPACING_MEDIUM, paddingTop: SPACING_MEDIUM }}>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold', textAlign: 'center' }}>{headerTitle}</Text>
        </View>
      )}

      <View style={containerCombinedStyle}>
        <View style={[styles.searchFilterContainer, searchbarContainerStyle]}>
          <Searchbar
            placeholder={uiSearchPlaceholder}
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            showDivider={false}
            clearIcon={searchQuery.length > 0 ? ({ color }) => (
              <PaperIconButton
                icon="close-circle"
                size={20}
                iconColor={color}
                onPress={handleClearSearch}
              />
            ) : undefined}
          />
          {showFilterButton && FilterComponent && (
            <PaperIconButton
              icon={showFilterUI ? "filter-off" : "filter"}
              onPress={toggleFilterVisibility}
              iconColor={theme.colors.onSurfaceVariant}
              size={24}
              style={styles.filterButton}
            />
          )}
        </View>

        {showFilterUI && FilterComponent && (
          <FilterComponent filters={filters} setFilters={setFilters} toggleFilterVisibility={toggleFilterVisibility} />
        )}

        {isError && (
          <View style={styles.errorContainer}>
            <Text variant="bodyMedium" style={styles.errorText}>
              {error?.message || 'An unknown error occurred.'}
            </Text>
          </View>
        )}

        <FlatList
          showsVerticalScrollIndicator={false}
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={flatListContentCombinedStyle}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={React.useMemo(() => [theme.colors.primary], [theme.colors.primary])}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={EmptyComponent}
          ListFooterComponent={FooterComponent}
        />
      </View>
    </View>
  );
}
