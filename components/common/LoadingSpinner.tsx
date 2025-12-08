import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

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

export default LoadingSpinner;
