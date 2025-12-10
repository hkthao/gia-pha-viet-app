import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Text } from 'react-native-paper';

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
    return (<View style={styles.footer}>
      <Text style={styles.emptyListText}>{t('common.noMoreItems')}</Text>
    </View>
    );
  }
  return <></>;
});

ListFooter.displayName = 'ListFooter';

export default ListFooter;
