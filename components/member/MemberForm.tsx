import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native'; // Added Platform
import { Button, Text, TextInput, useTheme, Avatar, SegmentedButtons, Switch } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useMemberForm } from '@/hooks/member/useMemberForm';
import { MemberDetailDto } from '@/types/member'; // Import MemberDetailDto
import { MemberFormData } from '@/utils/validation/memberValidationSchema';
import { SPACING_EXTRA_LARGE, SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import * as ImagePicker from 'expo-image-picker';
import { useMediaLibraryPermissions } from 'expo-image-picker';
import DefaultFamilyAvatar from '@/assets/images/familyAvatar.png'; // Re-use for member if no specific one
import { Gender } from '@/types';
import MemberSelectInput from './MemberSelectInput';
import { DateInput } from '@/components/common'; // Import DateInput
import { Controller, useWatch } from 'react-hook-form'; // Import Controller, useWatch

interface MemberFormProps {
  initialValues?: MemberDetailDto;
  onSubmit: (data: MemberFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export const MemberForm: React.FC<MemberFormProps> = ({ initialValues, onSubmit, isSubmitting: isSubmittingProp }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const { control, handleSubmit, errors, setValue, isSubmitting, isValid } = useMemberForm({ initialValues, onSubmit, isSubmitting: isSubmittingProp });

  const [mediaLibraryPermission, requestMediaLibraryPermission] = useMediaLibraryPermissions();

  const isDeceasedValue = !!useWatch({ control, name: 'isDeceased' });

  React.useEffect(() => {
    if (!isDeceasedValue) {
      setValue('dateOfDeath', null, { shouldValidate: true });
    }
  }, [isDeceasedValue, setValue]);

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
      marginVertical: SPACING_MEDIUM,
    },
  });

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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

          <Controller
            control={control}
            name="nickname"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={t('memberForm.nickname')}
                mode="outlined"
                value={value ?? ''}
                onChangeText={onChange}
                style={styles.input}
                error={!!errors.nickname}
                left={<TextInput.Icon icon="card-account-details-outline" />}
              />
            )}
          />
          {errors.nickname && <Text style={styles.errorText}>{errors.nickname.message}</Text>}

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={t('memberForm.phone')}
                mode="outlined"
                value={value ?? ''}
                onChangeText={onChange}
                style={styles.input}
                error={!!errors.phone}
                left={<TextInput.Icon icon="phone" />}
                keyboardType="phone-pad"
              />
            )}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={t('memberForm.email')}
                mode="outlined"
                value={value ?? ''}
                onChangeText={onChange}
                style={styles.input}
                error={!!errors.email}
                left={<TextInput.Icon icon="email" />}
                keyboardType="email-address"
              />
            )}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

          <Controller
            control={control}
            name="order"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={t('memberForm.order')}
                mode="outlined"
                value={value?.toString() ?? ''}
                onChangeText={(text) => onChange(text ? parseInt(text, 10) : undefined)}
                style={styles.input}
                error={!!errors.order}
                left={<TextInput.Icon icon="format-list-numbered" />}
                keyboardType="numeric"
              />
            )}
          />
          {errors.order && <Text style={styles.errorText}>{errors.order.message}</Text>}

          <View style={styles.segmentedButtonContainer}>
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
            name="isDeceased"
            render={({ field: { onChange, value } }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING_MEDIUM }}>
                <Switch
                  value={!!value}
                  onValueChange={onChange}
                />
                <Text style={{ marginLeft: SPACING_MEDIUM }}>{t('memberForm.isDeceased')}</Text>
              </View>
            )}
          />

          {isDeceasedValue && (
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
          )}

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

          <Controller
            control={control}
            name="isRoot"
            render={({ field: { onChange, value } }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING_MEDIUM }}>
                <Switch
                  value={!!value}
                  onValueChange={onChange}
                />
                <Text style={{ marginLeft: SPACING_MEDIUM }}>{t('memberForm.isRoot')}</Text>
              </View>
            )}
          />
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
                  onMemberSelected={(id: string | null, name: string | null) => onChange(id === null ? undefined : id)}
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
                  onMemberSelected={(id: string | null, name: string | null) => onChange(id === null ? undefined : id)}
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
                  onMemberSelected={(id: string | null, name: string | null) => onChange(id === null ? undefined : id)}
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
                  onMemberSelected={(id: string | null, name: string | null) => onChange(id === null ? undefined : id)}
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