import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Text, Appbar } from 'react-native-paper'; // Import Text and Appbar from react-native-paper
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router'; // Remove useRouter
import { MemberForm } from '@/components/member';
import { useCreateMember } from '@/hooks/member/useCreateMember';
import { MemberFormData } from '@/utils/validation/memberValidationSchema';
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore'; // To get current family ID
import { Gender } from '@/types'; // Import Gender enum

export default function CreateMemberScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter(); // Initialize useRouter
  const { createMember, isCreatingMember } = useCreateMember();
  const currentFamilyId = useCurrentFamilyStore((state) => state.currentFamilyId);
  const { familyId: paramFamilyId } = useLocalSearchParams();
  const initialFamilyId = Array.isArray(paramFamilyId) ? paramFamilyId[0] : paramFamilyId || currentFamilyId;

  // Extract initial data from URL params
  const {
    firstName,
    lastName,
    dateOfBirth,
    dateOfDeath,
    gender,
    // Add other relevant fields if needed
  } = useLocalSearchParams();

  const defaultValues = useMemo(() => ({
    firstName: typeof firstName === 'string' ? firstName : undefined,
    lastName: typeof lastName === 'string' ? lastName : undefined,
    dateOfBirth: typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : undefined,
    dateOfDeath: typeof dateOfDeath === 'string' ? new Date(dateOfDeath) : undefined,
    gender: typeof gender === 'string' && Object.values(Gender).includes(gender as Gender) ? (gender as Gender) : undefined,
    familyId: initialFamilyId, // Always include familyId
  }), [firstName, lastName, dateOfBirth, dateOfDeath, gender, initialFamilyId]);
  
  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleSubmit = useCallback(async (data: MemberFormData) => {
    await createMember(data);
  }, [createMember]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

  if (!initialFamilyId) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>{t('memberForm.errors.noFamilyId')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleCancel} />
        <Appbar.Content title={t('memberForm.createTitle')} />
      </Appbar.Header>
      <MemberForm
        onSubmit={handleSubmit}
        isSubmitting={isCreatingMember}
        initialValues={defaultValues}
      />
    </View>
  );
}
