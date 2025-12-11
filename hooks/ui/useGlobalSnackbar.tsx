import React, { useState, useContext, createContext, useCallback } from 'react';
import GlobalSnackbar from '@/components/common/GlobalSnackbar'; // Import the new component

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

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <GlobalSnackbar
        visible={visible}
        message={message}
        type={type}
        onDismissSnackbar={onDismissSnackbar}
      />
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
