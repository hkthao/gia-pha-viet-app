import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import {
  TextInput,
  Button,
  List,
  useTheme,
  Text,
  MD3Theme,
  RadioButton,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FamilyLocationFormData, familyLocationValidationSchema } from '@/utils/validation/familyLocationValidationSchema';
import { SPACING_EXTRA_LARGE, SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { LocationType, LocationAccuracy, LocationSource } from '@/types';
import * as yup from 'yup';

interface FamilyLocationFormProps {
  initialValues?: Partial<FamilyLocationFormData>;
  onSubmit: (data: FamilyLocationFormData) => void;
  isSubmitting?: boolean;
}

const getStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    scrollContent: {
      padding: SPACING_MEDIUM,
    },
    container: {
      marginBottom: SPACING_EXTRA_LARGE,
    },
    input: {
      marginBottom: SPACING_MEDIUM,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: SPACING_SMALL,
      marginTop: SPACING_MEDIUM,
    },
    radioGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: SPACING_MEDIUM,
    },
    radioItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: SPACING_MEDIUM,
      marginBottom: SPACING_SMALL,
    },
    saveButton: {
      marginTop: SPACING_MEDIUM,
      borderRadius: theme.roundness,
    },
    errorText: {
      color: theme.colors.error,
      marginBottom: SPACING_SMALL,
      marginLeft: SPACING_MEDIUM,
    },
    coordsInputRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING_MEDIUM,
    },
    coordsInput: {
      flex: 1,
    },
    coordsInputSpacer: {
      width: SPACING_MEDIUM,
    },
  });

const typedFamilyLocationValidationSchema: yup.ObjectSchema<FamilyLocationFormData> = familyLocationValidationSchema as yup.ObjectSchema<FamilyLocationFormData>;

export const FamilyLocationForm: React.FC<FamilyLocationFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FamilyLocationFormData>({
    resolver: yupResolver(typedFamilyLocationValidationSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      description: '',
      address: '',
      latitude: undefined,
      longitude: undefined,
      locationType: LocationType.Home,
      accuracy: LocationAccuracy.Estimated,
      source: LocationSource.UserSelected,
      ...initialValues,
    },
  });

  const locationTypeOptions = useMemo(() => ([
    { label: t('locationType.home'), value: LocationType.Home.toString() },
    { label: t('locationType.birthplace'), value: LocationType.Birthplace.toString() },
    { label: t('locationType.deathplace'), value: LocationType.Deathplace.toString() },
    { label: t('locationType.burial'), value: LocationType.Burial.toString() },
    { label: t('locationType.other'), value: LocationType.Other.toString() },
  ]), [t]);

  const accuracyOptions = useMemo(() => ([
    { label: t('locationAccuracy.exact'), value: LocationAccuracy.Exact.toString() },
    { label: t('locationAccuracy.approximate'), value: LocationAccuracy.Approximate.toString() },
    { label: t('locationAccuracy.estimated'), value: LocationAccuracy.Estimated.toString() },
  ]), [t]);

  const sourceOptions = useMemo(() => ([
    { label: t('locationSource.userSelected'), value: LocationSource.UserSelected.toString() },
    { label: t('locationSource.geocoded'), value: LocationSource.Geocoded.toString() },
  ]), [t]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* Name */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('familyLocationForm.name')}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                mode="outlined"
                style={styles.input}
                theme={{ colors: { primary: theme.colors.primary, outline: theme.colors.outline } }}
                error={!!errors.name}
                testID="familyLocationNameInput"
                left={<TextInput.Icon icon="map-marker-account" />}
              />
            )}
          />
          {errors.name && <Text style={styles.errorText}>{t(errors.name.message!)}</Text>}

          {/* Description */}
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('familyLocationForm.description')}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
                theme={{ colors: { primary: theme.colors.primary, outline: theme.colors.outline } }}
                error={!!errors.description}
                testID="familyLocationDescriptionInput"
                left={<TextInput.Icon icon="file-document-outline" />}
              />
            )}
          />
          {errors.description && <Text style={styles.errorText}>{t(errors.description.message!)}</Text>}

          {/* Address */}
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('familyLocationForm.address')}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                mode="outlined"
                style={styles.input}
                theme={{ colors: { primary: theme.colors.primary, outline: theme.colors.outline } }}
                error={!!errors.address}
                testID="familyLocationAddressInput"
                left={<TextInput.Icon icon="home-map-marker" />}
              />
            )}
          />
          {errors.address && <Text style={styles.errorText}>{t(errors.address.message!)}</Text>}

          {/* Latitude and Longitude */}
          <View style={styles.coordsInputRow}>
            <Controller
              control={control}
              name="latitude"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label={t('familyLocationForm.latitude')}
                  value={value?.toString()}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(text ? parseFloat(text) : undefined)}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.coordsInput}
                  theme={{ colors: { primary: theme.colors.primary, outline: theme.colors.outline } }}
                  error={!!errors.latitude}
                  testID="familyLocationLatitudeInput"
                  left={<TextInput.Icon icon="latitude" />}
                />
              )}
            />
            <View style={styles.coordsInputSpacer} />
            <Controller
              control={control}
              name="longitude"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label={t('familyLocationForm.longitude')}
                  value={value?.toString()}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(text ? parseFloat(text) : undefined)}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.coordsInput}
                  theme={{ colors: { primary: theme.colors.primary, outline: theme.colors.outline } }}
                  error={!!errors.longitude}
                  testID="familyLocationLongitudeInput"
                  left={<TextInput.Icon icon="longitude" />}
                />
              )}
            />
          </View>
          {errors.latitude && <Text style={styles.errorText}>{t(errors.latitude.message!)}</Text>}
          {errors.longitude && <Text style={styles.errorText}>{t(errors.longitude.message!)}</Text>}


          {/* Location Type */}
          <List.Section title={t('familyLocationForm.locationType')}>
            <Controller
              control={control}
              name="locationType"
              render={({ field: { onChange, value } }) => (
                <RadioButton.Group onValueChange={(val) => onChange(parseInt(val, 10))} value={value.toString()}>
                  <View style={styles.radioGroup}>
                    {locationTypeOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => onChange(parseInt(option.value, 10))}
                        style={styles.radioItem}
                      >
                        <RadioButton value={option.value} status={value.toString() === option.value ? 'checked' : 'unchecked'} />
                        <Text style={{ color: theme.colors.onSurface }}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </RadioButton.Group>
              )}
            />
            {errors.locationType && <Text style={styles.errorText}>{t(errors.locationType.message!)}</Text>}
          </List.Section>

          {/* Accuracy */}
          <List.Section title={t('familyLocationForm.accuracy')}>
            <Controller
              control={control}
              name="accuracy"
              render={({ field: { onChange, value } }) => (
                <RadioButton.Group onValueChange={(val) => onChange(parseInt(val, 10))} value={value.toString()}>
                  <View style={styles.radioGroup}>
                    {accuracyOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => onChange(parseInt(option.value, 10))}
                        style={styles.radioItem}
                      >
                        <RadioButton value={option.value} status={value.toString() === option.value ? 'checked' : 'unchecked'} />
                        <Text style={{ color: theme.colors.onSurface }}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </RadioButton.Group>
              )}
            />
            {errors.accuracy && <Text style={styles.errorText}>{t(errors.accuracy.message!)}</Text>}
          </List.Section>

          {/* Source */}
          <List.Section title={t('familyLocationForm.source')}>
            <Controller
              control={control}
              name="source"
              render={({ field: { onChange, value } }) => (
                <RadioButton.Group onValueChange={(val) => onChange(parseInt(val, 10))} value={value.toString()}>
                  <View style={styles.radioGroup}>
                    {sourceOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => onChange(parseInt(option.value, 10))}
                        style={styles.radioItem}
                      >
                        <RadioButton value={option.value} status={value.toString() === option.value ? 'checked' : 'unchecked'} />
                        <Text style={{ color: theme.colors.onSurface }}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </RadioButton.Group>
              )}
            />
            {errors.source && <Text style={styles.errorText}>{t(errors.source.message!)}</Text>}
          </List.Section>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.saveButton}
            testID="saveFamilyLocationButton"
          >
            {t('common.save')}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
