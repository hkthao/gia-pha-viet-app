// gia-pha-viet-app/components/memory/MemoryItemForm.tsx

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, FlatList, TouchableOpacity } from 'react-native';
import { Button, Text, TextInput, useTheme, Chip, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { SPACING_EXTRA_LARGE, SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { EmotionalTag, MemoryItemDto, MemberListDto, MemoryPersonDto } from '@/types';
import { MemoryItemFormData } from '@/utils/validation/memoryItemValidationSchema';
import { useMemoryItemForm } from '@/hooks/memory/useMemoryItemForm';
import * as ImagePicker from 'expo-image-picker';
import { useMediaLibraryPermissions } from 'expo-image-picker';
import { DateInput } from '@/components/common';
import dayjs from 'dayjs';
import ImageViewing from 'react-native-image-viewing';
import { Image } from 'expo-image';
import MemberSelectModalComponent from '@/components/member/MemberSelectModal';
interface MemoryItemFormProps {
  initialValues?: MemoryItemDto;
  onSubmit: (data: MemoryItemFormData) => Promise<void>;
  isEditMode: boolean;
  familyId: string;
  processing: boolean;
}

const getStyles = (theme: any) => StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING_MEDIUM,
    paddingBottom: SPACING_EXTRA_LARGE,
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
    borderRadius: theme.roundness,
  },
  formSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    marginBottom: SPACING_MEDIUM,
    elevation: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING_SMALL,
    marginBottom: SPACING_MEDIUM,
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING_SMALL,
    marginBottom: SPACING_MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageThumbnail: {
    width: 100,
    height: 100,
    borderRadius: theme.roundness,
  },
});

export const MemoryItemForm: React.FC<MemoryItemFormProps> = ({ initialValues, onSubmit, isEditMode, familyId, processing }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const { control, handleSubmit, errors, isSubmitting, isValid } = useMemoryItemForm({ initialValues, onSubmit, familyId });

  const [selectedImages, setSelectedImages] = useState<string[]>(initialValues?.memoryMedia?.map(file => file.url).filter((url): url is string => url !== undefined) || []);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

  const [selectedRelatedMembers, setSelectedRelatedMembers] = useState<MemoryPersonDto[]>(initialValues?.memoryPersons || []);
  const [showMemberSelectModal, setShowMemberSelectModal] = useState(false);

  const [mediaLibraryPermission, requestMediaLibraryPermission] = useMediaLibraryPermissions();

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
      allowsMultipleSelection: true,
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImages = result.assets.map(asset => {
        return asset.uri;
      });
      setSelectedImages(prev => [...prev, ...newImages]);
    }
  };

  const handleSelectMember = useCallback((members: MemberListDto[]) => {
    const newMemoryPersons: MemoryPersonDto[] = members.map(member => ({
      memberId: member.id,
      memberName: member.fullName,
      memberAvatarUrl: member.avatarUrl,
    }));

    // Filter out duplicates if any, though the modal should handle this
    const uniqueNewMembers = newMemoryPersons.filter(
      nm => !selectedRelatedMembers.some(existing => existing.memberId === nm.memberId)
    );

    setSelectedRelatedMembers(prev => [...prev, ...uniqueNewMembers]);
    setShowMemberSelectModal(false);
  }, [selectedRelatedMembers]);

  const handleRemoveMember = useCallback((memberId: string) => {
    setSelectedRelatedMembers(prev => prev.filter(p => p.memberId !== memberId));
  }, []);

  const getEmotionalTagOptions = () => ([
    { label: t('emotionalTag.happy'), value: EmotionalTag.Happy.toString() },
    { label: t('emotionalTag.sad'), value: EmotionalTag.Sad.toString() },
    { label: t('emotionalTag.proud'), value: EmotionalTag.Proud.toString() },
    { label: t('emotionalTag.memorial'), value: EmotionalTag.Memorial.toString() },
    { label: t('emotionalTag.neutral'), value: EmotionalTag.Neutral.toString() },
  ]);

  const imagesForViewer = selectedImages.map(uri => ({ uri }));

  const openImageViewer = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setIsImageViewerVisible(true);
  }, []);

  const closeImageViewer = useCallback(() => {
    setIsImageViewerVisible(false);
  }, []);

  return (
    <View style={styles.mainContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {selectedImages.length > 0 && (
            <View style={{ marginBottom: SPACING_MEDIUM }}>
              <FlatList
                data={selectedImages}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => openImageViewer(index)}
                    style={{ marginRight: SPACING_SMALL }}
                  >
                    <Image source={{ uri: item }} style={styles.imageThumbnail} />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.mediaContainer}
              />
            </View>
          )}

          <Button
            mode="outlined"
            onPress={pickImage}
            style={[styles.button, { marginBottom: SPACING_MEDIUM }]}
            icon="image-plus"
            disabled={!mediaLibraryPermission?.granted}
          >
            {t('memory.chooseImage')}
          </Button>

          <View style={styles.formSection}>
            {/* Remove the section title for memory.details as per request */}
            {/* <Text variant="titleMedium" style={styles.sectionTitle}>{t('memory.details')}</Text> */}
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label={t('memory.title')}
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  error={!!errors.title}
                  multiline
                  left={<TextInput.Icon icon="format-title" />}
                />
              )}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label={t('memory.description')}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                  error={!!errors.description}
                  left={<TextInput.Icon icon="note-text-outline" />}
                />
              )}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}

            <Controller
              control={control}
              name="happenedAt"
              render={({ field: { onChange, value } }) => (
                <DateInput
                  label={t('memory.happenedAt')}
                  value={value ? dayjs(value).toDate() : undefined}
                  onChange={(date) => onChange(date ? date.toISOString() : undefined)}
                  maximumDate={new Date()}
                  error={!!errors.happenedAt}
                  helperText={errors.happenedAt?.message}
                  style={styles.input}
                />
              )}
            />

            <Text variant="bodyLarge" style={{ marginBottom: SPACING_SMALL }}>{t('memory.emotionalTag')}</Text>
              <Controller
                control={control}
                name="emotionalTag"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.chipContainer}>
                    {getEmotionalTagOptions().map((option) => (
                      <Chip
                        key={option.value}
                        selected={value !== undefined && value.toString() === option.value}
                        onPress={() => onChange(parseInt(option.value, 10))}
                        mode="outlined"
                        style={{ borderColor: theme.colors.outline }}
                      >
                        {option.label}
                      </Chip>
                    ))}
                  </View>
                )}
              />
          </View>

          <View style={styles.formSection}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING_SMALL }}>
              <Text variant="titleMedium">{t('memory.involvedPersons')}</Text>
              <IconButton
                icon="account-plus"
                size={28}
                onPress={() => setShowMemberSelectModal(true)}
              />
            </View>
            {selectedRelatedMembers.length > 0 && (
              <View style={styles.chipContainer}>
                {selectedRelatedMembers.map((item) => (
                  <Chip
                    key={item.memberId}
                    avatar={item.memberAvatarUrl ? <Image source={{ uri: item.memberAvatarUrl }} style={{ width: 24, height: 24, borderRadius: 12 }} /> : undefined}
                    onClose={() => handleRemoveMember(item.memberId)}
                    style={{ marginRight: SPACING_SMALL }}
                  >
                    {item.memberName}
                  </Chip>
                ))}
              </View>
            )}
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[styles.button, { marginHorizontal: 0 }]}
            loading={isSubmitting || processing}
            disabled={isSubmitting || processing || !isValid}
          >
            {isEditMode ? t('common.saveChanges') : t('common.create')}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>

      <ImageViewing
        images={imagesForViewer}
        imageIndex={currentImageIndex}
        visible={isImageViewerVisible}
        onRequestClose={closeImageViewer}
      />

      <MemberSelectModalComponent
        isVisible={showMemberSelectModal}
        onClose={() => setShowMemberSelectModal(false)}
        onSelectMultipleMembers={(members) => handleSelectMember(members)}
        fieldName="involvedMembers"
        multiSelect={true}
        initialSelectedMembers={selectedRelatedMembers.map(mp => ({
          id: mp.memberId,
          fullName: mp.memberName || '', // Provide a default empty string if memberName is undefined
          avatarUrl: mp.memberAvatarUrl,
          // Add other required MemberListDto properties, even if empty/dummy
          firstName: '',
          lastName: '',
          code: '',
          familyId: '',
          isRoot: false,
          created: '',
        }))}
      />
    </View>
  );
};
