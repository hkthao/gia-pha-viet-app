import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location'; // Import expo-location
import { Alert } from 'react-native';
import { MAX_UPLOAD_FILE_SIZE_BYTES, MAX_UPLOAD_FILE_SIZE_MB } from '@/constants/dimensions'; // Import size constants
import { ChatLocationDto } from '@/types'; // Import ChatLocationDto

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

export const useChatInputActions = (
  onImagePicked: (uri: string) => void,
  onLocationSelected: (location: ChatLocationDto) => void // Add onLocationSelected
): UseChatInputActions => {
  const { t } = useTranslation();
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const showDialog = useCallback(() => setIsDialogVisible(true), []);
  const hideDialog = useCallback(() => setIsDialogVisible(false), []);

  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();

  const handleImageSelection = useCallback(async (pickerFunction: () => Promise<ImagePicker.ImagePickerResult>) => {
    let result = await pickerFunction();

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];

      if (selectedAsset.fileSize && selectedAsset.fileSize > MAX_UPLOAD_FILE_SIZE_BYTES) {
        Alert.alert(
          t('common.error'),
          t('chatInput.fileTooLarge', { size: MAX_UPLOAD_FILE_SIZE_MB })
        );
        hideDialog();
        return;
      }

      const selectedUri = selectedAsset.uri;
      if (selectedUri) {
        onImagePicked(selectedUri);
      }
    }
    hideDialog();
  }, [hideDialog, onImagePicked, t]);

  const handleChooseFromLibrary = useCallback(async () => {
    if (!mediaLibraryPermission?.granted) {
      const { granted } = await requestMediaLibraryPermission();
      if (!granted) {
        Alert.alert(t('common.permissionRequired'), t('faceSearch.mediaLibraryPermissionDenied'));
        hideDialog();
        return;
      }
    }

    handleImageSelection(() =>
      ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        // No need for base64 if not used
      })
    );
  }, [hideDialog, handleImageSelection, mediaLibraryPermission, requestMediaLibraryPermission, t]);

  const handleTakePhoto = useCallback(async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert(t('common.permissionRequired'), t('faceSearch.cameraPermissionDenied'));
        hideDialog();
        return;
      }
    }

    handleImageSelection(() =>
      ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        // No need for base64 if not used
      })
    );
  }, [hideDialog, handleImageSelection, cameraPermission, requestCameraPermission, t]);

  const handleChooseCurrentLocation = useCallback(async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.permissionRequired'), t('chatInput.locationPermissionDenied'));
      hideDialog();
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      const chatLocation: ChatLocationDto = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        source: 'gps',
      };
      onLocationSelected(chatLocation);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(t('common.error'), t('chatInput.locationError'));
    } finally {
      hideDialog();
    }
  }, [hideDialog, onLocationSelected, t]);

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
