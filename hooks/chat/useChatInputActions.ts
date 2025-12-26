import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

interface UseChatInputActions {
  isDialogVisible: boolean;
  showDialog: () => void;
  hideDialog: () => void;
  handleChooseFromLibrary: () => void;
  handleTakePhoto: () => void;
  handleChooseCurrentLocation: () => void;
  handleChooseLocationFromMap: () => void;
  t: (key: string) => string;
}

export const useChatInputActions = (onImagePicked: (uri: string, base64: string) => void): UseChatInputActions => {
  const { t } = useTranslation();
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const showDialog = useCallback(() => setIsDialogVisible(true), []);
  const hideDialog = useCallback(() => setIsDialogVisible(false), []);

  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();

  const handleChooseFromLibrary = useCallback(async () => {
    if (!mediaLibraryPermission?.granted) {
      const { granted } = await requestMediaLibraryPermission();
      if (!granted) {
        Alert.alert(t('common.permissionRequired'), t('faceSearch.mediaLibraryPermissionDenied'));
        hideDialog();
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      const base64Data = result.assets[0].base64;
      if (selectedUri && base64Data) {
        onImagePicked(selectedUri, base64Data);
      }
    }
    hideDialog();
  }, [hideDialog, onImagePicked, mediaLibraryPermission, requestMediaLibraryPermission, t]);

  const handleTakePhoto = useCallback(async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert(t('common.permissionRequired'), t('faceSearch.cameraPermissionDenied'));
        hideDialog();
        return;
      }
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const takenUri = result.assets[0].uri;
      const base64Data = result.assets[0].base64;
      if (takenUri && base64Data) {
        onImagePicked(takenUri, base64Data);
      }
    }
    hideDialog();
  }, [hideDialog, onImagePicked, cameraPermission, requestCameraPermission, t]);

  const handleChooseCurrentLocation = useCallback(() => {
    console.log("Choose current location");
    hideDialog();
  }, [hideDialog]);

  const handleChooseLocationFromMap = useCallback(() => {
    console.log("Choose location from map");
    hideDialog();
  }, [hideDialog]);

  return {
    isDialogVisible,
    showDialog,
    hideDialog,
    handleChooseFromLibrary,
    handleTakePhoto,
    handleChooseCurrentLocation,
    handleChooseLocationFromMap,
    t,
  };
};
