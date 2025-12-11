import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Text, TextInput, useTheme, Avatar, SegmentedButtons, Chip } from 'react-native-paper'; // Added Chip
import { useTranslation } from 'react-i18next';
import { useFamilyForm } from '@/hooks/family/useFamilyForm';
import { FamilyFormData } from '@/utils/validation/familyValidationSchema';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import * as ImagePicker from 'expo-image-picker';
import { useMediaLibraryPermissions } from 'expo-image-picker';
import DefaultFamilyAvatar from '@/assets/images/familyAvatar.png';
import type { FamilyDetailDto, FamilyUserDto, UserCheckResultDto } from '@/types';
import { FamilyRole } from '@/types';
import { UserRoleSelector } from '@/components/common';

interface FamilyFormProps {
  initialValues?: FamilyDetailDto;
  onSubmit: (data: FamilyFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const FamilyForm: React.FC<FamilyFormProps> = ({ initialValues, onSubmit, onCancel, isSubmitting }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const { control, handleSubmit, errors, setValue, watch } = useFamilyForm({ initialValues, onSubmit, isSubmitting });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialValues?.avatarUrl || null);

  const [mediaLibraryPermission, requestMediaLibraryPermission] = useMediaLibraryPermissions();

  // Watch familyUsers from form state
  const familyUsers = watch('familyUsers') || [];

  // Initialize familyUsers from initialValues if present
  useEffect(() => {
    if (initialValues?.familyUsers) {
      setValue('familyUsers', initialValues.familyUsers, { shouldValidate: false });
    }
  }, [initialValues?.familyUsers, setValue]);

  const handleAddUserFromSelector = (userResult: UserCheckResultDto, role: FamilyRole) => {
    if (initialValues?.id === undefined) {
      Alert.alert(t('common.error'), t('familyForm.validation.cannotAddUsersDuringCreation'));
      return;
    }

    const newFamilyUser: FamilyUserDto = {
      familyId: initialValues?.id,
      userId: userResult.userId,
      userName: userResult.userName,
      role: role,
    };

    const isDuplicate = familyUsers.some(
      (fu) => fu.userId === newFamilyUser.userId && fu.role === newFamilyUser.role
    );
    if (isDuplicate) {
      Alert.alert(t('common.error'), t('familyForm.validation.userAlreadyAdded'));
      return;
    }

    const updatedFamilyUsers = [...familyUsers, newFamilyUser];
    setValue('familyUsers', updatedFamilyUsers, { shouldValidate: true });
  };

  const handleRemoveUserFromSelector = (userIdToRemove: string, roleToRemove: FamilyRole) => {
    const updatedFamilyUsers = familyUsers.filter(
      (fu) => !(fu.userId === userIdToRemove && fu.role === roleToRemove)
    );
    setValue('familyUsers', updatedFamilyUsers, { shouldValidate: true });
  };

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
      base64: true, // Request base64 data
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      const base64Data = result.assets[0].base64; // Get base64 data

      setAvatarPreview(selectedUri);
      setValue('avatarUrl', selectedUri, { shouldValidate: true });
      if (base64Data) {
        setValue('avatarBase64', `data:image/jpeg;base64,${base64Data}`, { shouldValidate: true }); // Prepend data URI scheme
      }
    }
  };

  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      padding: SPACING_MEDIUM,
      paddingBottom: SPACING_MEDIUM * 3, // Adjust this based on your fixed button container height
    },
    input: {
      marginBottom: SPACING_MEDIUM,
      backgroundColor: theme.colors.surface,
    },
    errorText: {
      color: theme.colors.error,
      marginBottom: SPACING_MEDIUM,
    },
    fixedButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: SPACING_MEDIUM,
      borderTopWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.background,
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
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formSection}>

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

          <TextInput
            label={t('familyForm.name')}
            mode="outlined"
            value={control._formValues.name}
            onChangeText={(text) => setValue('name', text, { shouldValidate: true })}
            style={styles.input}
            error={!!errors.name}
            left={<TextInput.Icon icon="account" />}
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
            left={<TextInput.Icon icon="note-text-outline" />}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}

          <TextInput
            label={t('familyForm.address')}
            mode="outlined"
            multiline
            numberOfLines={2}
            value={control._formValues.address}
            onChangeText={(text) => setValue('address', text, { shouldValidate: true })}
            style={styles.input}
            error={!!errors.address}
            left={<TextInput.Icon icon="map-marker-outline" />}
          />
          {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}
        </View>

        <View style={styles.formSection}>
          <SegmentedButtons
            theme={{ roundness: theme.roundness }}
            value={control._formValues.visibility as 'Public' | 'Private'}
            onValueChange={newValue => setValue('visibility', newValue as 'Public' | 'Private', { shouldValidate: true })}
            buttons={[
              {
                value: 'Public',
                label: t('familyForm.public'),
                style: {
                  borderRadius: theme.roundness,
                }
              },
              {
                value: 'Private',
                label: t('familyForm.private'),
                style: {
                  borderRadius: theme.roundness,
                }
              },
            ]}
          />
          {errors.visibility && <Text style={styles.errorText}>{errors.visibility.message}</Text>}
        </View>

        <UserRoleSelector
          title={t('familyForm.managers')}
          familyUsers={familyUsers}
          role={FamilyRole.Manager}
          onAddUser={handleAddUserFromSelector}
          onRemoveUser={handleRemoveUserFromSelector}
        />

        <UserRoleSelector
          title={t('familyForm.viewers')}
          familyUsers={familyUsers}
          role={FamilyRole.Viewer}
          onAddUser={handleAddUserFromSelector}
          onRemoveUser={handleRemoveUserFromSelector}
        />

      </ScrollView>
      <View style={styles.fixedButtonContainer}>
        <Button mode="outlined" onPress={onCancel} style={styles.button} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button mode="contained" onPress={handleSubmit} style={styles.button} loading={isSubmitting}>
          {t('common.save')}
        </Button>
      </View>

    </View>
  );
};
