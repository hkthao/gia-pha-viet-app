import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface UseChatInputActions {
  isDialogVisible: boolean;
  showDialog: () => void;
  hideDialog: () => void;
  handleUpload: () => void;
  handleChooseCurrentLocation: () => void;
  handleChooseLocationFromMap: () => void;
  t: (key: string) => string;
}

export const useChatInputActions = (): UseChatInputActions => {
  const { t } = useTranslation();
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const showDialog = useCallback(() => setIsDialogVisible(true), []);
  const hideDialog = useCallback(() => setIsDialogVisible(false), []);

  const handleUpload = useCallback(() => {
    // TODO: Implement upload functionality
    console.log("Upload image/PDF");
    hideDialog();
  }, [hideDialog]);

  const handleChooseCurrentLocation = useCallback(() => {
    // TODO: Implement choose current location functionality
    console.log("Choose current location");
    hideDialog();
  }, [hideDialog]);

  const handleChooseLocationFromMap = useCallback(() => {
    // TODO: Implement choose location from map functionality
    console.log("Choose location from map");
    hideDialog();
  }, [hideDialog]);

  return {
    isDialogVisible,
    showDialog,
    hideDialog,
    handleUpload,
    handleChooseCurrentLocation,
    handleChooseLocationFromMap,
    t,
  };
};
