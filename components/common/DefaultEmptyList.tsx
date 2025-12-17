import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

interface DefaultEmptyListProps {
  styles: any;
  t: (key: string) => string;
  message?: string;
}

const DefaultEmptyList: React.FC<DefaultEmptyListProps> = React.memo(({ styles, t, message }) => {
  return (
    <View style={{
      display:"flex",
      alignItems:"center"
    }}>
      {message ? (
        <Text variant="titleMedium" style={styles.emptyListText}>
          {message}
        </Text>
      ) : (
        <>
          <Text variant="titleMedium" style={styles.emptyListText}>
            {t('search.no_results')}
          </Text>
          <Text variant="bodyMedium" style={styles.emptyListText}>
            {t('search.try_different_query')}
          </Text>
        </>
      )}
    </View>
  );
});

DefaultEmptyList.displayName = 'DefaultEmptyList';

export default DefaultEmptyList;
