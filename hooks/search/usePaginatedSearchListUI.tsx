import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SPACING_MEDIUM, SPACING_LARGE } from '@/constants/dimensions';
import DefaultEmptyList from '@/components/common/DefaultEmptyList';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ListFooter from '@/components/common/ListFooter';

export interface UsePaginatedSearchListUIProps {
  ListEmptyComponent?: React.ComponentType | React.ReactElement | null;
  loading: boolean;
  refreshing: boolean;
  itemsLength: number;
  hasMore: boolean;
  searchPlaceholder?: string;
  error?: string | null; // Added error prop
}

export function usePaginatedSearchListUI({
  ListEmptyComponent,
  loading,
  refreshing,
  itemsLength,
  hasMore,
  searchPlaceholder,
  error, // Destructure the new error prop
}: UsePaginatedSearchListUIProps) { // Dummy comment to trigger re-evaluation
  const { t } = useTranslation();
  const theme = useTheme();

  const [showFilterUI, setShowFilterUI] = useState(false);

  const toggleFilterVisibility = useCallback(() => {
    setShowFilterUI((prev) => !prev);
  }, []);

  const styles = useMemo(
    () => StyleSheet.create({
        safeArea: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        container: {},
        searchFilterContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: SPACING_MEDIUM,
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: theme.roundness,
        },
        searchbar: {
          flex: 1,
          borderRadius: theme.roundness,
          backgroundColor: 'transparent',
        },
        filterButton: {
          // styles for the filter icon button
        },
        errorContainer: {
          padding: SPACING_MEDIUM,
          backgroundColor: theme.colors.errorContainer,
          marginBottom: SPACING_MEDIUM,
          borderRadius: theme.roundness,
        },
        errorText: {
          color: theme.colors.onErrorContainer,
          textAlign: 'center',
        },
        emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: SPACING_LARGE,
        },
        footer: {
          paddingVertical: SPACING_MEDIUM,
          alignItems: 'center',
        },
        emptyListText: {
          color: theme.colors.onBackground,
          textAlign: 'center',
          marginTop: SPACING_MEDIUM,
        },
      }),
    [theme],
  );

  const EmptyComponent = useMemo(() => {
    if (loading || refreshing) {
      return <LoadingSpinner styles={styles} theme={theme} />;
    }
    if (ListEmptyComponent) {
      return React.isValidElement(ListEmptyComponent)
        ? ListEmptyComponent
        : React.createElement(ListEmptyComponent as React.ComponentType);
    }
    return <DefaultEmptyList styles={styles} t={t} />;
  }, [loading, refreshing, ListEmptyComponent, styles, theme, t]);

  const FooterComponent = useMemo(() => {
    return (
      <ListFooter
        loading={loading}
        itemsLength={itemsLength}
        hasMore={hasMore}
        styles={styles}
        theme={theme}
        t={t}
      />
    );
  }, [loading, itemsLength, hasMore, styles, theme, t]);

  return {
    showFilterUI,
    toggleFilterVisibility,
    styles,
    EmptyComponent,
    FooterComponent,
    searchPlaceholder: searchPlaceholder || t('search.placeholder'),
    theme, // Export theme so PaginatedSearchList can use it for RefreshControl
  };
}