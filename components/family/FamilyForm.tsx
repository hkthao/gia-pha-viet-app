import React, { useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services';
import { UserListDto, FamilyRole } from '@/types';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Text, TextInput, useTheme, Avatar, SegmentedButtons } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useFamilyForm } from '@/hooks/family/useFamilyForm';
import { FamilyFormData } from '@/utils/validation/familyValidationSchema';
import { SPACING_EXTRA_LARGE, SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import * as ImagePicker from 'expo-image-picker';
import { useMediaLibraryPermissions } from 'expo-image-picker';
import DefaultFamilyAvatar from '@/assets/images/familyAvatar.png';
import type { FamilyDetailDto } from '@/types';
import { UserSelectInput } from '@/components/user';
import { Controller } from 'react-hook-form';

interface FamilyFormProps {
  initialValues?: FamilyDetailDto;
  onSubmit: (data: FamilyFormData) => Promise<void>;
}

export const FamilyForm: React.FC<FamilyFormProps> = ({ initialValues, onSubmit }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { control, handleSubmit, errors, setValue, watch, isSubmitting, isValid } = useFamilyForm({ initialValues, onSubmit });
  const queryClient = useQueryClient();

  const [mediaLibraryPermission, requestMediaLibraryPermission] = useMediaLibraryPermissions();

  // Watch managerIds and viewerIds from the form
  const managerIds = watch('managerIds');
  const viewerIds = watch('viewerIds');

  // Combine all user IDs for fetching details
  const allUserIds = useMemo(() => {
    const uniqueIds = new Set([...(managerIds || []), ...(viewerIds || [])]);
    return Array.from(uniqueIds);
  }, [managerIds, viewerIds]);

  // Fetch details for all users (managers and viewers)
  const { data: fetchedAllUserDetails } = useQuery<UserListDto[], Error, UserListDto[], [string, { userIds: string[] }]>({
    queryKey: ['familyUserDetails', { userIds: allUserIds }],
    queryFn: async ({ queryKey }) => {
      const [, { userIds: idsToFetch }] = queryKey;
      if (!idsToFetch || idsToFetch.length === 0) {
        return [];
      }
      const result = await userService.getByIds(idsToFetch);
      return result;
    },
    enabled: allUserIds.length > 0,
  });

  // Derive managers and viewers with full details for display in UserSelectInput
  const managersWithDetails = useMemo(() => {
    if (!fetchedAllUserDetails || !managerIds) {
      return [];
    }
    return managerIds.map(id => fetchedAllUserDetails.find(user => user.id === id)).filter(Boolean) as UserListDto[];
  }, [managerIds, fetchedAllUserDetails]);

  const viewersWithDetails = useMemo(() => {
    if (!fetchedAllUserDetails || !viewerIds) {
      return [];
    }
    return viewerIds.map(id => fetchedAllUserDetails.find(user => user.id === id)).filter(Boolean) as UserListDto[];
  }, [viewerIds, fetchedAllUserDetails]);

  // Handle changes for managers
  const handleManagersChanged = useCallback((newManagerIds: string[]) => {
    setValue('managerIds', newManagerIds, { shouldValidate: true });
    queryClient.invalidateQueries({ queryKey: ['familyUserDetails'] }); // Invalidate detail query in this component
    queryClient.invalidateQueries({ queryKey: ['users'] }); // Invalidate general users query for UserSelectInput
  }, [setValue, queryClient]);

  // Handle changes for viewers
  const handleViewersChanged = useCallback((newViewerIds: string[]) => {
    setValue('viewerIds', newViewerIds, { shouldValidate: true });
    queryClient.invalidateQueries({ queryKey: ['familyUserDetails'] }); // Invalidate detail query in this component
    queryClient.invalidateQueries({ queryKey: ['users'] }); // Invalidate general users query for UserSelectInput
  }, [setValue, queryClient]);





  const pickImage = async (onFieldChange: (value: string | undefined) => void) => {
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

      onFieldChange(selectedUri); // Use onChange from Controller
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
      paddingBottom: SPACING_EXTRA_LARGE
    },
    input: {
      marginBottom: SPACING_MEDIUM,
      backgroundColor: theme.colors.surface,
    },
    errorText: {
      color: theme.colors.error,
      marginBottom: SPACING_MEDIUM,
    },
    button: {
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
          <Controller
            control={control}
            name="avatarUrl"
            render={({ field: { onChange, value } }) => (
              <View style={styles.avatarSection}>
                <Avatar.Image
                  size={96}
                  source={value ? { uri: value } : DefaultFamilyAvatar}
                  style={styles.avatar}
                />
                <Button mode="outlined" onPress={() => pickImage(onChange)} disabled={!mediaLibraryPermission?.granted}>
                  {t('common.chooseAvatar')}
                </Button>
              </View>
            )}
          />
          {errors.avatarUrl && <Text style={styles.errorText}>{errors.avatarUrl.message}</Text>}
        </View>

        <View style={styles.formSection}>
          <Controller
            control={control}
            name="visibility"
            render={({ field: { onChange, value } }) => (
              <SegmentedButtons
                theme={{ roundness: theme.roundness }}
                value={value as 'Public' | 'Private'}
                onValueChange={newValue => onChange(newValue as 'Public' | 'Private')}
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
            )}
          />
          {errors.visibility && <Text style={styles.errorText}>{errors.visibility.message}</Text>}
        </View>

        <View style={styles.formSection}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={t('familyForm.name')}
                mode="outlined"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                error={!!errors.name}
                left={<TextInput.Icon icon="account" />}
              />
            )}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={t('familyForm.address')}
                mode="outlined"
                multiline
                numberOfLines={2}
                value={value}
                onChangeText={onChange}
                style={styles.input}
                error={!!errors.address}
                left={<TextInput.Icon icon="map-marker-outline" />}
              />
            )}
          />
          {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={t('familyForm.description')}
                mode="outlined"
                multiline
                numberOfLines={10}
                value={value}
                onChangeText={onChange}
                style={styles.input}
                error={!!errors.description}
                left={<TextInput.Icon icon="note-text-outline" />}
              />
            )}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}
        </View>

        <View style={styles.formSection}>
          <UserSelectInput
            userIds={managerIds || []}
            onUserIdsChanged={handleManagersChanged}
            label={t('familyForm.selectManagers')}
            leftIcon="account-group"
          />


          <UserSelectInput
            userIds={viewerIds || []}
            onUserIdsChanged={handleViewersChanged}
            label={t('familyForm.selectViewers')}
            leftIcon="account-group-outline"
          />

        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={[styles.button, { marginHorizontal: 0}]}
          loading={isSubmitting}
          disabled={isSubmitting || !isValid}
        >
          {t('common.save')}
        </Button>
      </ScrollView>
    </View>
  );
};