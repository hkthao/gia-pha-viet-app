import React, { useState, useContext, createContext, useCallback } from 'react';
import LoadingOverlay from '@/components/common/LoadingOverlay'; // Import the new component

interface LoadingOverlayContextType {
  showLoading: () => void;
  hideLoading: () => void;
  isLoading: boolean;
}

const LoadingOverlayContext = createContext<LoadingOverlayContextType | undefined>(undefined);

export const LoadingOverlayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const showLoading = useCallback(() => setIsLoading(true), []);
  const hideLoading = useCallback(() => setIsLoading(false), []);

  return (
    <LoadingOverlayContext.Provider value={{ showLoading, hideLoading, isLoading }}>
      {children}
      <LoadingOverlay isLoading={isLoading} />
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
