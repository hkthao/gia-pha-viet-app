import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Text } from 'react-native-paper'; // Import Text from react-native-paper
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router'; // Remove useRouter
import { MemberForm } from '@/components/member';
import { useCreateMember } from '@/hooks/member/useCreateMember';
import { MemberFormData } from '@/utils/validation/memberValidationSchema';
import { useFamilyStore } from '@/stores/useFamilyStore'; // To get current family ID

export default function CreateMemberScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { createMember, isCreatingMember } = useCreateMember();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);
  const { familyId: paramFamilyId } = useLocalSearchParams();
  const initialFamilyId = Array.isArray(paramFamilyId) ? paramFamilyId[0] : paramFamilyId || currentFamilyId;
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
      <MemberForm
        onSubmit={handleSubmit}
        isSubmitting={isCreatingMember}
      />
    </View>
  );
}
