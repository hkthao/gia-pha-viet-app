import React from 'react';
import { FlatList, View, RefreshControl, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { Searchbar, Text, IconButton as PaperIconButton } from 'react-native-paper';
import { usePaginatedSearch, PaginatedSearchOptions, PaginatedSearchResult } from '@/hooks/usePaginatedSearch';
import { usePaginatedSearchListUI } from '@/hooks/usePaginatedSearchListUI';
import { SPACING_MEDIUM } from '@/constants/dimensions';

interface PaginatedSearchListProps<T, Q extends { searchTerm?: string }> {
  searchOptions: Omit<PaginatedSearchOptions<T, Q>, 'useStore'>;
  useStore: PaginatedSearchOptions<T, Q>['useStore'];

  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  ListEmptyComponent?: React.ComponentType | React.ReactElement | null;
  ListHeaderComponent?: React.ComponentType | React.ReactElement | null;
  FilterComponent?: React.ComponentType<{ filters: Q; setFilters: React.Dispatch<React.SetStateAction<Q>>; toggleFilterVisibility?: () => void; }>;
  headerTitle?: string;
  // Style props
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  searchbarContainerStyle?: StyleProp<ViewStyle>;
  showFilterButton?: boolean;
}

export function PaginatedSearchList<T, Q extends { searchTerm?: string }>(
  props: PaginatedSearchListProps<T, Q>
) {
  const {
    searchOptions,
    useStore,
    renderItem,
    keyExtractor,
    ListEmptyComponent,
    ListHeaderComponent,
    FilterComponent,
    headerTitle,
    containerStyle,
    contentContainerStyle,
    searchbarContainerStyle,
    showFilterButton = false,
  } = props;

  // Use the custom hook to handle search logic
  const {
    items,
    loading,
    error,
    hasMore,
    refreshing,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    handleRefresh,
    handleLoadMore,
  } = usePaginatedSearch<T, Q>({
    useStore,
    initialQuery: searchOptions.initialQuery,
    debounceTime: searchOptions.debounceTime,
    externalDependencies: searchOptions.externalDependencies,
  });

  const {
    showFilterUI,
    toggleFilterVisibility,
    styles,
    EmptyComponent,
    FooterComponent,
    searchPlaceholder,
    theme,
  } = usePaginatedSearchListUI({
    ListEmptyComponent,
    loading,
    refreshing,
    itemsLength: items.length,
    hasMore,
    searchPlaceholder: props.searchPlaceholder,
  });

  return (
    <View style={[styles.safeArea, containerStyle]}>
      {headerTitle && (
        <View style={{ paddingHorizontal: SPACING_MEDIUM, paddingTop: SPACING_MEDIUM }}>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold', textAlign: 'center' }}>{headerTitle}</Text>
        </View>
      )}

      <View style={[styles.container, containerStyle]}>
        <View style={[styles.searchFilterContainer, searchbarContainerStyle]}>
          <Searchbar
            placeholder={searchPlaceholder}
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            showDivider={false} // Divider can be managed by container style
            clearIcon={searchQuery.length > 0 ? ({ color }) => (
              <PaperIconButton
                icon="close-circle"
                size={20}
                iconColor={color}
                onPress={React.useCallback(() => setSearchQuery(''), [setSearchQuery])}
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

        {error && (
          <View style={styles.errorContainer}>
            <Text variant="bodyMedium" style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}

        <FlatList
          showsVerticalScrollIndicator={false}
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[styles.container, contentContainerStyle]}
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
