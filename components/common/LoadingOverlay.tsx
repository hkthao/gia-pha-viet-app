import React from 'react';
import { ActivityIndicator, Portal, useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

interface LoadingOverlayProps {
  isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  const theme = useTheme(); // Use theme for coloring the indicator

  const styles = StyleSheet.create({
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999, // Ensure it's on top
    },
  });

  if (!isLoading) {
    return null;
  }

  return (
    <Portal>
      <View style={styles.loadingOverlay}>
        <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
      </View>
    </Portal>
  );
};

export default LoadingOverlay;