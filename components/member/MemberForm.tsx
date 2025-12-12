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
import DateTimePicker from '@react-native-community/datetimepicker'; // Use new DatePicker

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
  const gender = watch('gender');
  const dateOfBirth = watch('dateOfBirth');
  const dateOfDeath = watch('dateOfDeath');
  const placeOfBirth = watch('placeOfBirth');
  const placeOfDeath = watch('placeOfDeath');
  const occupation = watch('occupation');
  const biography = watch('biography');
  const motherId = watch('motherId');
  const fatherId = watch('fatherId');
  const husbandId = watch('husbandId');
  const wifeId = watch('wifeId');

  const [showPickerBirth, setShowPickerBirth] = useState(false);
  const [showPickerDeath, setShowPickerDeath] = useState(false);

  const handleDateChange = useCallback((event: any, selectedDate: Date | undefined, field: 'dateOfBirth' | 'dateOfDeath') => {
    if (field === 'dateOfBirth') setShowPickerBirth(false);
    if (field === 'dateOfDeath') setShowPickerDeath(false);

    if (selectedDate) {
      setValue(field, selectedDate, { shouldValidate: true });
    } else {
      setValue(field, null, { shouldValidate: true });
    }
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
      marginBottom: SPACING_MEDIUM,
      elevation: 1,
      padding: SPACING_MEDIUM,
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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>{t('memberDetail.personalInfo')}</Text>

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

          <TextInput
            label={t('memberForm.firstName')}
            mode="outlined"
            value={firstName}
            onChangeText={(text) => setValue('firstName', text, { shouldValidate: true })}
            style={styles.input}
            error={!!errors.firstName}
            left={<TextInput.Icon icon="account" />}
          />
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName.message}</Text>}

          <TextInput
            label={t('memberForm.lastName')}
            mode="outlined"
            value={lastName}
            onChangeText={(text) => setValue('lastName', text, { shouldValidate: true })}
            style={styles.input}
            error={!!errors.lastName}
            left={<TextInput.Icon icon="account-details" />}
          />
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName.message}</Text>}

          <View style={styles.segmentedButtonContainer}>
            <Text style={{ marginBottom: SPACING_SMALL }}>{t('memberForm.gender')}</Text>
            <SegmentedButtons
              value={gender as string}
              onValueChange={newValue => setValue('gender', newValue as Gender, { shouldValidate: true })}
              buttons={[
                { value: Gender.Male, label: t('common.male') },
                { value: Gender.Female, label: t('common.female') },
                { value: Gender.Other, label: t('common.other') },
              ]}
            />
            {errors.gender && <Text style={styles.errorText}>{errors.gender.message}</Text>}
          </View>

          <Button
            mode="outlined"
            onPress={() => setShowPickerBirth(true)}
            style={styles.datePickerButton}
            labelStyle={{ justifyContent: 'flex-start' }}
            uppercase={false}
          >
            {t('memberForm.dateOfBirth')}: {dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : t('common.noDate')}
          </Button>
          {showPickerBirth && (
            <DateTimePicker
              value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'dateOfBirth')}
            />
          )}
          {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth.message}</Text>}

          <Button
            mode="outlined"
            onPress={() => setShowPickerDeath(true)}
            style={styles.datePickerButton}
            labelStyle={{ justifyContent: 'flex-start' }}
            uppercase={false}
          >
            {t('memberForm.dateOfDeath')}: {dateOfDeath ? new Date(dateOfDeath).toLocaleDateString() : t('common.noDate')}
          </Button>
          {showPickerDeath && (
            <DateTimePicker
              value={dateOfDeath ? new Date(dateOfDeath) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'dateOfDeath')}
            />
          )}
          {errors.dateOfDeath && <Text style={styles.errorText}>{errors.dateOfDeath.message}</Text>}


          <TextInput
            label={t('memberDetail.placeOfBirth')}
            mode="outlined"
            value={placeOfBirth ?? ''}
            onChangeText={(text) => setValue('placeOfBirth', text, { shouldValidate: true })}
            style={styles.input}
            error={!!errors.placeOfBirth}
            left={<TextInput.Icon icon="map-marker-outline" />}
          />
          {errors.placeOfBirth && <Text style={styles.errorText}>{errors.placeOfBirth.message}</Text>}

          <TextInput
            label={t('memberDetail.placeOfDeath')}
            mode="outlined"
            value={placeOfDeath ?? ''}
            onChangeText={(text) => setValue('placeOfDeath', text, { shouldValidate: true })}
            style={styles.input}
            error={!!errors.placeOfDeath}
            left={<TextInput.Icon icon="map-marker-off-outline" />}
          />
          {errors.placeOfDeath && <Text style={styles.errorText}>{errors.placeOfDeath.message}</Text>}


          <TextInput
            label={t('memberDetail.occupation')}
            mode="outlined"
            value={occupation ?? ''}
            onChangeText={(text) => setValue('occupation', text, { shouldValidate: true })}
            style={styles.input}
            error={!!errors.occupation}
            left={<TextInput.Icon icon="briefcase-outline" />}
          />
          {errors.occupation && <Text style={styles.errorText}>{errors.occupation.message}</Text>}

          <TextInput
            label={t('memberDetail.biography')}
            mode="outlined"
            multiline
            numberOfLines={10}
            value={biography ?? ''}
            onChangeText={(text) => setValue('biography', text, { shouldValidate: true })}
            style={styles.input}
            error={!!errors.biography}
            left={<TextInput.Icon icon="note-text-outline" />}
          />
          {errors.biography && <Text style={styles.errorText}>{errors.biography.message}</Text>}
        </View>

        <View style={styles.formSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>{t('memberDetail.familyRelationships')}</Text>

          <TextInput
            label={t('member.father')}
            mode="outlined"
            value={fatherId ?? ''}
            onChangeText={(text) => setValue('fatherId', text, { shouldValidate: true })}
            style={styles.input}
            error={!!errors.fatherId}
            left={<TextInput.Icon icon="account-male-outline" />}
          />
          {errors.fatherId && <Text style={styles.errorText}>{errors.fatherId.message}</Text>}

          <TextInput
            label={t('member.mother')}
            mode="outlined"
            value={motherId ?? ''}
            onChangeText={(text) => setValue('motherId', text, { shouldValidate: true })}
            style={styles.input}
            error={!!errors.motherId}
            left={<TextInput.Icon icon="account-female-outline" />}
          />
          {errors.motherId && <Text style={styles.errorText}>{errors.motherId.message}</Text>}

          <TextInput
            label={t('member.husband')}
            mode="outlined"
            value={husbandId ?? ''}
            onChangeText={(text) => setValue('husbandId', text, { shouldValidate: true })}
            style={styles.input}
            error={!!errors.husbandId}
            left={<TextInput.Icon icon="human-male-boy" />}
          />
          {errors.husbandId && <Text style={styles.errorText}>{errors.husbandId.message}</Text>}

          <TextInput
            label={t('member.wife')}
            mode="outlined"
            value={wifeId ?? ''}
            onChangeText={(text) => setValue('wifeId', text, { shouldValidate: true })}
            style={styles.input}
            error={!!errors.wifeId}
            left={<TextInput.Icon icon="human-female-girl" />}
          />
          {errors.wifeId && <Text style={styles.errorText}>{errors.wifeId.message}</Text>}

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