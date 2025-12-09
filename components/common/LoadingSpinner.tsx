import React from 'react';
import { ActivityIndicator, View } from 'react-native';

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

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
