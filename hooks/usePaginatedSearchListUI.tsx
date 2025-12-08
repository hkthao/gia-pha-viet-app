import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SPACING_MEDIUM, SPACING_LARGE } from '@/constants/dimensions';

// Standalone Components
interface DefaultEmptyListProps {
  styles: any;
  t: (key: string) => string;
}
const DefaultEmptyList: React.FC<DefaultEmptyListProps> = React.memo(({ styles, t }) => {
  return (
    <View style={styles.emptyContainer}>
      <Text variant="titleMedium" style={styles.emptyListText}>
        {t('search.no_results')}
      </Text>
      <Text variant="bodyMedium" style={styles.emptyListText}>
        {t('search.try_different_query')}
      </Text>
    </View>
  );
});

interface LoadingSpinnerProps {
  styles: any;
  theme: any;
}
const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(({ styles, theme }) => {
  return (
    <View style={styles.emptyContainer}>
      <ActivityIndicator animating size="large" color={theme.colors.primary} />
    </View>
  );
});

interface ListFooterProps {
  loading: boolean;
  itemsLength: number;
  hasMore: boolean;
  styles: any;
  theme: any;
  t: (key: string) => string;
}
const ListFooter: React.FC<ListFooterProps> = React.memo(({ loading, itemsLength, hasMore, styles, theme, t }) => {
  if (loading && itemsLength > 0) {
    return (
      <View style={styles.footer}>
        <ActivityIndicator animating size="small" color={theme.colors.primary} />
      </View>
    );
  }
  if (!hasMore && itemsLength > 0) {
    return <Text style={styles.emptyListText}>{t('common.noMoreItems')}</Text>;
  }
  return null;
});


interface UsePaginatedSearchListUIProps {
  ListEmptyComponent?: React.ComponentType | React.ReactElement | null;
  loading: boolean;
  refreshing: boolean;
  itemsLength: number;
  hasMore: boolean;
  searchPlaceholder?: string;
}

export function usePaginatedSearchListUI({
  ListEmptyComponent,
  loading,
  refreshing,
  itemsLength,
  hasMore,
  searchPlaceholder,
}: UsePaginatedSearchListUIProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [showFilterUI, setShowFilterUI] = useState(false);

  const toggleFilterVisibility = useCallback(() => {
    setShowFilterUI((prev) => !prev);
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
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