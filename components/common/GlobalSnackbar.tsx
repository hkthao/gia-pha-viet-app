import React, { useMemo } from 'react';
import { Snackbar, Portal } from 'react-native-paper';

interface GlobalSnackbarProps {
  visible: boolean;
  message: string;
  type: 'info' | 'success' | 'error';
  onDismissSnackbar: () => void;
}

const GlobalSnackbar: React.FC<GlobalSnackbarProps> = ({
  visible,
  message,
  type,
  onDismissSnackbar,
}) => {
  // Determine background color based on type
  const backgroundColor = useMemo(() => {
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
  );
};

export default GlobalSnackbar;