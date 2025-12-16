import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Text, Appbar } from 'react-native-paper'; // Import Text and Appbar from react-native-paper
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router'; // Remove useRouter
import { MemberForm } from '@/components/member';
import { useCreateMember } from '@/hooks/member/useCreateMember';
import { MemberFormData } from '@/utils/validation/memberValidationSchema';
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore'; // To get current family ID

export default function CreateMemberScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter(); // Initialize useRouter
  const { createMember, isCreatingMember } = useCreateMember();
  const currentFamilyId = useCurrentFamilyStore((state) => state.currentFamilyId);
  const { familyId: paramFamilyId } = useLocalSearchParams();
  const initialFamilyId = Array.isArray(paramFamilyId) ? paramFamilyId[0] : paramFamilyId || currentFamilyId;
  
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
      />
    </View>
  );
}
