import React, { useState, useContext, createContext, useCallback } from 'react';
import { ActivityIndicator, Portal, useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

interface LoadingOverlayContextType {
  showLoading: () => void;
  hideLoading: () => void;
  isLoading: boolean;
}

const LoadingOverlayContext = createContext<LoadingOverlayContextType | undefined>(undefined);

export const LoadingOverlayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme(); // Use theme for coloring the indicator

  const showLoading = useCallback(() => setIsLoading(true), []);
  const hideLoading = useCallback(() => setIsLoading(false), []);

  const styles = StyleSheet.create({
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999, // Ensure it's on top
    },
  });

  return (
    <LoadingOverlayContext.Provider value={{ showLoading, hideLoading, isLoading }}>
      {children}
      {isLoading && (
        <Portal>
          <View style={styles.loadingOverlay}>
            <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
          </View>
        </Portal>
      )}
    </LoadingOverlayContext.Provider>
  );
};

export const useLoadingOverlay = () => {
  const context = useContext(LoadingOverlayContext);
  if (context === undefined) {
    throw new Error('useLoadingOverlay must be used within a LoadingOverlayProvider');
  }
  return context;
};
