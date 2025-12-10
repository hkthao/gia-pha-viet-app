import React, { useState, useContext, createContext, useCallback } from 'react';
import { Snackbar } from 'react-native-paper';
import { Portal } from 'react-native-paper'; // Portal is needed for Snackbar to render above other elements

interface SnackbarContextType {
  showSnackbar: (message: string, type?: 'info' | 'success' | 'error') => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'error'>('info');

  const showSnackbar = useCallback((msg: string, snackbarType: 'info' | 'success' | 'error' = 'info') => {
    setMessage(msg);
    setType(snackbarType);
    setVisible(true);
  }, []);

  const onDismissSnackbar = useCallback(() => {
    setVisible(false);
    setMessage('');
  }, []);

  // Determine background color based on type
  const backgroundColor = React.useMemo(() => {
    switch (type) {
      case 'success':
        return '#4CAF50'; // Green
      case 'error':
        return '#F44336'; // Red
      case 'info':
      default:
        return '#2196F3'; // Blue
    }
  }, [type]);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Portal>
        <Snackbar
          visible={visible}
          onDismiss={onDismissSnackbar}
          duration={3000} // Display for 3 seconds
          wrapperStyle={{ bottom: 0 }} // Position at the bottom
          style={{ backgroundColor: backgroundColor }}
        >
          {message}
        </Snackbar>
      </Portal>
    </SnackbarContext.Provider>
  );
};

export const useGlobalSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useGlobalSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
