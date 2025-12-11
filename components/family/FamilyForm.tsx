import React, { useCallback, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Text, TextInput, useTheme, Switch, List, Avatar, Portal } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useFamilyForm } from '@/hooks/family/useFamilyForm';
import { FamilyFormData } from '@/utils/validation/familyValidationSchema';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import * as ImagePicker from 'expo-image-picker';
import { useMediaLibraryPermissions } from 'expo-image-picker'; // Corrected import
import DefaultFamilyAvatar from '@/assets/images/familyAvatar.png';
import type { FamilyDetailDto } from '@/types/family';
import { useOptionSelectBottomSheet } from '@/hooks/ui/useOptionSelectBottomSheet'; // Import the new hook

interface FamilyFormProps {
  initialValues?: FamilyDetailDto;
  onSubmit: (data: FamilyFormData) => Promise<void>; // Corrected type
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const FamilyForm: React.FC<FamilyFormProps> = ({ initialValues, onSubmit, onCancel, isSubmitting }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const { control, handleSubmit, errors, setValue, watch } = useFamilyForm({ initialValues, onSubmit, isSubmitting }); // Add watch to get current visibility
  const currentVisibility = watch('visibility'); // Watch the visibility field

  const { openBottomSheet, OptionSelectBottomSheetComponent } = useOptionSelectBottomSheet(); // Initialize the hook
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialValues?.avatarUrl || null);

  const [mediaLibraryPermission, requestMediaLibraryPermission] = useMediaLibraryPermissions();

  // Define visibility options for the bottom sheet
  const visibilityOptions = useMemo(() => [
    { label: t('familyForm.public'), value: 'Public' },
    { label: t('familyForm.private'), value: 'Private' },
  ], [t]);

  // Handler for when a visibility option is selected from the bottom sheet
  const handleSelectVisibility = useCallback((value: any) => {
    setValue('visibility', value, { shouldValidate: true });
  }, [setValue]);



  const pickImage = async () => {
    if (!mediaLibraryPermission?.granted) {
      const { granted } = await requestMediaLibraryPermission();
      if (!granted) {
        Alert.alert(t('common.permissionRequired'), t('common.mediaLibraryPermissionDenied'));
        return;
      }
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      setAvatarPreview(selectedUri);
      setValue('avatarUrl', selectedUri, { shouldValidate: true });
    }
  };

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: SPACING_MEDIUM,
      backgroundColor: theme.colors.background,
    },
    input: {
      marginBottom: SPACING_MEDIUM,
      backgroundColor: theme.colors.surface,
    },
    errorText: {
      color: theme.colors.error,
      marginBottom: SPACING_MEDIUM,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: SPACING_MEDIUM,
    },
    button: {
      flex: 1,
      marginHorizontal: SPACING_SMALL / 2,
      borderRadius: theme.roundness,
    },
    formSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness,
      marginBottom: SPACING_MEDIUM,
      elevation: 1,
    },
    sectionTitle: {
      fontWeight: 'bold',
      padding: SPACING_MEDIUM,
      paddingBottom: SPACING_SMALL,
    },
    avatarSection: {
      alignItems: 'center',
      paddingVertical: SPACING_MEDIUM,
    },
    avatar: {
      marginBottom: SPACING_SMALL,
      backgroundColor: theme.colors.surfaceVariant,
    },
    visibilityToggle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING_MEDIUM,
      paddingVertical: SPACING_SMALL,
    },
  });

  return (
    <React.Fragment>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.formSection}>
        <Text variant="titleMedium" style={styles.sectionTitle}>{t('familyForm.avatar')}</Text>
        <View style={styles.avatarSection}>
          <Avatar.Image
            size={96}
            source={avatarPreview ? { uri: avatarPreview } : DefaultFamilyAvatar}
            style={styles.avatar}
          />
          <Button mode="outlined" onPress={pickImage} disabled={!mediaLibraryPermission?.granted}>
            {t('familyForm.chooseAvatar')}
          </Button>
          {errors.avatarUrl && <Text style={styles.errorText}>{errors.avatarUrl.message}</Text>}
        </View>
      </View>

      <View style={styles.formSection}>
        <Text variant="titleMedium" style={styles.sectionTitle}>{t('familyForm.generalInfo')}</Text>
        <TextInput
          label={t('familyForm.name')}
          mode="outlined"
          value={control._formValues.name}
          onChangeText={(text) => setValue('name', text, { shouldValidate: true })}
          style={styles.input}
          error={!!errors.name}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

        <TextInput
          label={t('familyForm.description')}
          mode="outlined"
          multiline
          numberOfLines={4}
          value={control._formValues.description}
          onChangeText={(text) => setValue('description', text, { shouldValidate: true })}
          style={styles.input}
          error={!!errors.description}
        />
        {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}

        <TextInput
          label={t('familyForm.address')}
          mode="outlined"
          value={control._formValues.address}
          onChangeText={(text) => setValue('address', text, { shouldValidate: true })}
          style={styles.input}
          error={!!errors.address}
        />
        {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}
      </View>

      <View style={styles.formSection}>
        <Text variant="titleMedium" style={styles.sectionTitle}>{t('familyForm.visibility')}</Text>
        <List.Item
          title={t('familyForm.visibilityLabel')}
          description={currentVisibility === 'Public' ? t('familyForm.publicDescription') : t('familyForm.privateDescription')}
          onPress={() => openBottomSheet(
            visibilityOptions,
            handleSelectVisibility,
            t('familyForm.selectVisibility'),
            currentVisibility
          )}
          left={() => <List.Icon icon={currentVisibility === 'Public' ? 'earth' : 'lock'} />}
          right={() => <List.Icon icon="chevron-right" />}
          style={{ paddingHorizontal: SPACING_MEDIUM }}
        />
        {errors.visibility && <Text style={styles.errorText}>{errors.visibility.message}</Text>}
      </View>

      <View style={styles.buttonContainer}>
        <Button mode="outlined" onPress={onCancel} style={styles.button} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button mode="contained" onPress={handleSubmit} style={styles.button} loading={isSubmitting}>
          {t('common.save')}
        </Button>
      </View>
    </ScrollView>
    <Portal>
      <OptionSelectBottomSheetComponent />
    </Portal>
    </React.Fragment>
  );
};
