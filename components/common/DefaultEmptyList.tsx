import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

interface DefaultEmptyListProps {
  styles: any;
  t: (key: string) => string;
}

const DefaultEmptyList: React.FC<DefaultEmptyListProps> = React.memo(({ styles, t }) => {
  return (
    <View style={{
      display:"flex",
      alignItems:"center"
    }}>
      <Text variant="titleMedium" style={styles.emptyListText}>
        {t('search.no_results')}
      </Text>
      <Text variant="bodyMedium" style={styles.emptyListText}>
        {t('search.try_different_query')}
      </Text>
    </View>
  );
});

DefaultEmptyList.displayName = 'DefaultEmptyList';

export default DefaultEmptyList;
