import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native'; // Added Platform
import { Button, Text, TextInput, useTheme, Avatar, SegmentedButtons } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useMemberForm } from '@/hooks/member/useMemberForm';
import { MemberDetailDto } from '@/types/member'; // Import MemberDetailDto
import { MemberFormData } from '@/utils/validation/memberValidationSchema';
import { SPACING_EXTRA_LARGE, SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import * as ImagePicker from 'expo-image-picker';
import { useMediaLibraryPermissions } from 'expo-image-picker';
import DefaultFamilyAvatar from '@/assets/images/familyAvatar.png'; // Re-use for member if no specific one
import { Gender } from '@/types';
import { MemberSelectInput } from './'; // Import MemberSelectInput from the index file
import { DateInput } from '@/components/common'; // Import DateInput
import { Controller } from 'react-hook-form'; // Import Controller

interface MemberFormProps {
  initialValues?: MemberDetailDto;
  onSubmit: (data: MemberFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export const MemberForm: React.FC<MemberFormProps> = ({ initialValues, onSubmit, isSubmitting: isSubmittingProp }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const { control, handleSubmit, errors, setValue, watch, isSubmitting, isValid } = useMemberForm({ initialValues, onSubmit, isSubmitting: isSubmittingProp });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialValues?.avatarUrl || null);

  const [mediaLibraryPermission, requestMediaLibraryPermission] = useMediaLibraryPermissions();

  const firstName = watch('firstName');
  const lastName = watch('lastName');
  // const gender = watch('gender'); // Removed
  const placeOfBirth = watch('placeOfBirth');
  const placeOfDeath = watch('placeOfDeath');
  const occupation = watch('occupation');
  const biography = watch('biography');
  // const motherId = watch('motherId'); // Removed
  // const fatherId = watch('fatherId'); // Removed
  // const husbandId = watch('husbandId'); // Removed
  // const wifeId = watch('wifeId'); // Removed

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
      padding: SPACING_MEDIUM,
    },
    scrollContent: {
      flexGrow: 1,
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
      marginVertical: SPACING_MEDIUM,
      borderRadius: theme.roundness,
    },
    formSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness,
      elevation: 1,
    },
    sectionTitle: {
      fontWeight: 'bold',
      marginBottom: SPACING_SMALL,
    },
    avatarSection: {
      alignItems: 'center',
      paddingVertical: SPACING_MEDIUM,
    },
    avatar: {
      marginBottom: SPACING_SMALL,
      backgroundColor: theme.colors.surfaceVariant,
    },
    datePickerButton: {
      marginBottom: SPACING_MEDIUM,
      borderRadius: theme.roundness,
      justifyContent: 'flex-start',
    },
    segmentedButtonContainer: {
      marginBottom: SPACING_MEDIUM,
    },
  });

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formSection}>
          <View style={styles.avatarSection}>
            <Avatar.Image
              size={96}
              source={avatarPreview ? { uri: avatarPreview } : DefaultFamilyAvatar}
              style={styles.avatar}
            />
            <Button mode="outlined" onPress={pickImage} disabled={!mediaLibraryPermission?.granted}>
              {t('memberForm.chooseAvatar')}
            </Button>
            {errors.avatarUrl && <Text style={styles.errorText}>{errors.avatarUrl.message}</Text>}
          </View>

          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={t('memberForm.firstName')}
                mode="outlined"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                error={!!errors.firstName}
                left={<TextInput.Icon icon="account" />}
              />
            )}
          />
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName.message}</Text>}

          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={t('memberForm.lastName')}
                mode="outlined"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                error={!!errors.lastName}
                left={<TextInput.Icon icon="account-details" />}
              />
            )}
          />
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName.message}</Text>}

          <View style={styles.segmentedButtonContainer}>
            <Text style={{ marginBottom: SPACING_SMALL }}>{t('memberForm.gender')}</Text>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, value } }) => (
                <SegmentedButtons
                  value={value as string}
                  onValueChange={newValue => onChange(newValue as Gender)}
                  buttons={[
                    {
                      value: Gender.Male, label: t('common.male'), style: {
                        borderRadius: theme.roundness
                      }
                    },
                    { value: Gender.Female, label: t('common.female') },
                    {
                      value: Gender.Other, label: t('common.other'), style: {
                        borderRadius: theme.roundness
                      }
                    },
                  ]}
                />
              )}
            />
            {errors.gender && <Text style={styles.errorText}>{errors.gender.message}</Text>}
          </View>

          <Controller
            control={control}
            name="dateOfBirth"
            render={({ field: { onChange, value } }) => (
              <DateInput
                label={t('memberForm.dateOfBirth')}
                value={value}
                onChange={onChange}
                maximumDate={new Date()}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth?.message}
                style={styles.input}
              />
            )}
          />

          <Controller
            control={control}
            name="dateOfDeath"
            render={({ field: { onChange, value } }) => (
              <DateInput
                label={t('memberForm.dateOfDeath')}
                value={value}
                onChange={onChange}
                maximumDate={new Date()}
                error={!!errors.dateOfDeath}
                helperText={errors.dateOfDeath?.message}
                style={styles.input}
              />
            )}
          />

          <Controller
            control={control}
            name="placeOfBirth"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={t('memberDetail.placeOfBirth')}
                mode="outlined"
                value={value ?? ''}
                onChangeText={onChange}
                style={styles.input}
                error={!!errors.placeOfBirth}
                left={<TextInput.Icon icon="map-marker-outline" />}
              />
            )}
          />
          {errors.placeOfBirth && <Text style={styles.errorText}>{errors.placeOfBirth.message}</Text>}

          <Controller
            control={control}
            name="placeOfDeath"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={t('memberDetail.placeOfDeath')}
                mode="outlined"
                value={value ?? ''}
                onChangeText={onChange}
                style={styles.input}
                error={!!errors.placeOfDeath}
                left={<TextInput.Icon icon="map-marker-off-outline" />}
              />
            )}
          />
          {errors.placeOfDeath && <Text style={styles.errorText}>{errors.placeOfDeath.message}</Text>}


          <Controller
            control={control}
            name="occupation"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={t('memberDetail.occupation')}
                mode="outlined"
                value={value ?? ''}
                onChangeText={onChange}
                style={styles.input}
                error={!!errors.occupation}
                left={<TextInput.Icon icon="briefcase-outline" />}
              />
            )}
          />
          {errors.occupation && <Text style={styles.errorText}>{errors.occupation.message}</Text>}

          <Controller
            control={control}
            name="biography"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={t('memberDetail.biography')}
                mode="outlined"
                multiline
                numberOfLines={10}
                value={value ?? ''}
                onChangeText={onChange}
                style={styles.input}
                error={!!errors.biography}
                left={<TextInput.Icon icon="note-text-outline" />}
              />
            )}
          />
          {errors.biography && <Text style={styles.errorText}>{errors.biography.message}</Text>}
        </View>

        <View style={styles.formSection}>
          <View style={styles.input}>
            <Controller
              control={control}
              name="fatherId"
              render={({ field: { onChange, value } }) => (
                <MemberSelectInput
                  label={t('member.father')}
                  memberId={value}
                  onMemberSelected={(id, name) => onChange(id === null ? undefined : id)}
                  error={!!errors.fatherId}
                  helperText={errors.fatherId?.message}
                  fieldName="fatherId"
                  leftIcon="human-male"
                />
              )}
            />
          </View>

          <View style={styles.input}>
            <Controller
              control={control}
              name="motherId"
              render={({ field: { onChange, value } }) => (
                <MemberSelectInput
                  label={t('member.mother')}
                  memberId={value}
                  onMemberSelected={(id, name) => onChange(id === null ? undefined : id)}
                  error={!!errors.motherId}
                  helperText={errors.motherId?.message}
                  fieldName="motherId"
                  leftIcon="human-female"
                />
              )}
            />
          </View>
          <View style={styles.input}>
            <Controller
              control={control}
              name="husbandId"
              render={({ field: { onChange, value } }) => (
                <MemberSelectInput
                  label={t('member.husband')}
                  memberId={value}
                  onMemberSelected={(id, name) => onChange(id === null ? undefined : id)}
                  error={!!errors.husbandId}
                  helperText={errors.husbandId?.message}
                  fieldName="husbandId"
                  leftIcon="human-male"
                />
              )}
            />
          </View>

          <View style={styles.input}>
            <Controller
              control={control}
              name="wifeId"
              render={({ field: { onChange, value } }) => (
                <MemberSelectInput
                  label={t('member.wife')}
                  memberId={value}
                  onMemberSelected={(id, name) => onChange(id === null ? undefined : id)}
                  error={!!errors.wifeId}
                  helperText={errors.wifeId?.message}
                  fieldName="wifeId"
                  leftIcon="human-female"
                />
              )}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={isSubmitting}
            disabled={isSubmitting || !isValid}
          >
            {t('common.save')}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};