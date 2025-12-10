import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useTheme, Button, Text, IconButton, Card } from 'react-native-paper';
import { MemberItem } from '@/components';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import { relationshipService } from '@/services';
import { DetectRelationshipResult, MemberListDto } from '@/types';
import { useTranslation } from 'react-i18next';
import { useFamilyStore } from '@/stores/useFamilyStore'; // Import useFamilyStore
import { useMemberSelectModal } from '@/hooks/useMemberSelectModal'; // Import the new hook

const DEFAULT_MEMBER_A: MemberListDto = {
  id: 'placeholder-A',
  fullName: 'detectRelationship.memberAPlaceholder', // Use translation key
  avatarUrl: '', // Or a placeholder image URL
  lastName: '',
  firstName: '',
  code: '',
  familyId: '',
  isRoot: false,
  created: '', // Add this line
};

const DEFAULT_MEMBER_B: MemberListDto = {
  id: 'placeholder-B',
  fullName: 'detectRelationship.memberBPlaceholder', // Use translation key
  avatarUrl: '', // Or a placeholder image URL
  lastName: '',
  firstName: '',
  code: '',
  familyId: '',
  isRoot: false,
  created: '', // Add this line
};

export default function DetectRelationshipScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId); 
  const [selectedMember1, setSelectedMember1] = useState<MemberListDto>(DEFAULT_MEMBER_A);
  const [selectedMember2, setSelectedMember2] = useState<MemberListDto>(DEFAULT_MEMBER_B);
  const [relationshipResult, setRelationshipResult] = useState<DetectRelationshipResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { showMemberSelectModal, MemberSelectModal: MemberSelectModalComponent } = useMemberSelectModal<'memberA' | 'memberB'>(); 

  const handleMemberSelected = useCallback((member: MemberListDto, fieldName: 'memberA' | 'memberB') => {
    if (fieldName === 'memberA') {
      setSelectedMember1(member);
    } else if (fieldName === 'memberB') {
      setSelectedMember2(member);
    }
  }, []);

  const handleDetectRelationship = useCallback(async () => {
    if (!selectedMember1?.id || !selectedMember2?.id || !currentFamilyId) {
      setError(t('detectRelationship.validationError'));
      return;
    }

    setLoading(true);
    setError(null);
    setRelationshipResult(null);

    try {
      const result = await relationshipService.detectRelationship(currentFamilyId, selectedMember1.id, selectedMember2.id);
      setRelationshipResult(result);
    } catch (e: any) {
      setError(e.message || t('detectRelationship.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [selectedMember1, selectedMember2, currentFamilyId, t, setError, setLoading, setRelationshipResult]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: SPACING_MEDIUM,
    },
    selectedMemberWrapper: {
      position: "relative"
    },
    button: {
      borderRadius: theme.roundness
    },
    clearButton: {
      position: "absolute",
      right: -5,
      top: -5
    },
    resultContainer: {
      borderRadius: theme.roundness,
      padding: SPACING_MEDIUM,
      marginTop: SPACING_MEDIUM,
    },
    resultTitle: {
      fontWeight: 'bold',
      marginBottom: SPACING_MEDIUM / 2,
    },
    resultText: {
      marginBottom: SPACING_MEDIUM / 2,
    },
    errorText: {
      color: theme.colors.error,
      marginBottom: SPACING_MEDIUM,
    },
  });

  const handleOpenMemberSelect = useCallback((fieldName: 'memberA' | 'memberB') => {
    showMemberSelectModal(handleMemberSelected, fieldName);
  }, [showMemberSelectModal, handleMemberSelected]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.selectedMemberWrapper}>
          <MemberItem
            item={{
              ...selectedMember1,
              fullName: selectedMember1.id === DEFAULT_MEMBER_A.id ? t(DEFAULT_MEMBER_A.fullName) : selectedMember1.fullName,
            }}
            onPress={() => handleOpenMemberSelect('memberA')}
          />
          {selectedMember1.id !== DEFAULT_MEMBER_A.id && (
            <IconButton
              icon="close-circle"
              size={24}
              style={styles.clearButton}
              onPress={() => setSelectedMember1(DEFAULT_MEMBER_A)}
              accessibilityLabel={t('common.clearSelection')}
            />
          )}
        </View>

        <View style={styles.selectedMemberWrapper}>
          <MemberItem
            item={{
              ...selectedMember2,
              fullName: selectedMember2.id === DEFAULT_MEMBER_B.id ? t(DEFAULT_MEMBER_B.fullName) : selectedMember2.fullName,
            }}
            onPress={() => handleOpenMemberSelect('memberB')}
          />
          {selectedMember2.id !== DEFAULT_MEMBER_B.id && (
            <IconButton
              icon="close-circle"
              size={24}
              style={styles.clearButton}
              onPress={() => setSelectedMember2(DEFAULT_MEMBER_B)}
              accessibilityLabel={t('common.clearSelection')}
            />
          )}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Button
          mode="contained"
          onPress={handleDetectRelationship}
          loading={loading}
          disabled={loading || selectedMember1.id === DEFAULT_MEMBER_A.id || selectedMember2.id === DEFAULT_MEMBER_B.id || !currentFamilyId}
          style={styles.button}
        >
          {t('detectRelationship.detectButton')}
        </Button>

        {relationshipResult && (
          <Card style={styles.resultContainer} >
            <Card.Title title={t('detectRelationship.resultTitle')} />
            <Card.Content>
              <Text style={styles.resultText}>
                {relationshipResult.description}
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
      <MemberSelectModalComponent />
    </View>
  );
}
