import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useTheme, Button, Text, Surface } from 'react-native-paper';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import { relationshipService } from '@/services';
import { DetectRelationshipResult, MemberListDto } from '@/types';
import { useTranslation } from 'react-i18next';
// import { router } from 'expo-router'; // No longer needed
import { useMemberSelectModal } from '@/hooks/useMemberSelectModal'; // Import the new hook

export default function DetectRelationshipScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  // const params = useLocalSearchParams(); // No longer needed, as modal handles selection callback

  const [member1Id, setMember1Id] = useState<string>('');
  const [member1Name, setMember1Name] = useState<string>('');
  const [member2Id, setMember2Id] = useState<string>('');
  const [member2Name, setMember2Name] = useState<string>('');
  const [relationshipResult, setRelationshipResult] = useState<DetectRelationshipResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { showMemberSelectModal, MemberSelectModal: MemberSelectModalComponent } = useMemberSelectModal<'member1' | 'member2'>(); // Use the hook

  const handleMemberSelected = useCallback((member: MemberListDto, fieldName: 'member1' | 'member2') => {
    if (fieldName === 'member1') {
      setMember1Id(member.id);
      setMember1Name(member.fullName || member.id); // Display full name or ID
    } else if (fieldName === 'member2') {
      setMember2Id(member.id);
      setMember2Name(member.fullName || member.id); // Display full name or ID
    }
  }, []);

  const handleDetectRelationship = useCallback(async () => {
    if (!member1Id || !member2Id) {
      setError(t('detectRelationship.validationError'));
      return;
    }

    setLoading(true);
    setError(null);
    setRelationshipResult(null);

    try {
      const result = await relationshipService.detectRelationship(member1Id, member2Id);
      setRelationshipResult(result);
    } catch (e: any) {
      setError(e.message || t('detectRelationship.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [member1Id, member2Id, t, setError, setLoading, setRelationshipResult]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: SPACING_MEDIUM,
    },
    memberSelectButton: {
      justifyContent: 'flex-start',
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: SPACING_MEDIUM,
    },
    memberSelectButtonContent: {
      justifyContent: 'flex-start',
    },
    selectedMemberText: {
      textAlign: 'left',
    },
    button: {
      marginTop: SPACING_MEDIUM,
      marginBottom: SPACING_MEDIUM * 2,
    },
    resultContainer: {
      padding: SPACING_MEDIUM,
      borderRadius: theme.roundness,
      marginBottom: SPACING_MEDIUM,
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

  const handleOpenMemberSelect = useCallback((fieldName: 'member1' | 'member2') => {
    showMemberSelectModal(handleMemberSelected, fieldName);
  }, [showMemberSelectModal, handleMemberSelected]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Button
          mode="outlined"
          onPress={() => handleOpenMemberSelect('member1')}
          style={styles.memberSelectButton}
          contentStyle={styles.memberSelectButtonContent}
          labelStyle={styles.selectedMemberText}
        >
          {member1Name || t('detectRelationship.member1Placeholder')}
        </Button>
        <Button
          mode="outlined"
          onPress={() => handleOpenMemberSelect('member2')}
          style={styles.memberSelectButton}
          contentStyle={styles.memberSelectButtonContent}
          labelStyle={styles.selectedMemberText}
        >
          {member2Name || t('detectRelationship.member2Placeholder')}
        </Button>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Button
          mode="contained"
          onPress={handleDetectRelationship}
          loading={loading}
          disabled={loading || !member1Id || !member2Id}
          style={styles.button}
        >
          {t('detectRelationship.detectButton')}
        </Button>

        {relationshipResult && (
          <Surface style={styles.resultContainer} elevation={1}>
            <Text style={styles.resultTitle}>{t('detectRelationship.resultTitle')}</Text>
            <Text style={styles.resultText}>
              <Text style={{ fontWeight: 'bold' }}>{t('detectRelationship.description')}: </Text>
              {relationshipResult.description}
            </Text>
            <Text style={styles.resultText}>
              <Text style={{ fontWeight: 'bold' }}>{t('detectRelationship.edges')}: </Text>
              {relationshipResult.edges?.join(', ')}
            </Text>
            <Text style={styles.resultText}>
              <Text style={{ fontWeight: 'bold' }}>{t('detectRelationship.path')}: </Text>
              {relationshipResult.path?.join(' -> ')}
            </Text>
          </Surface>
        )}
      </ScrollView>
      <MemberSelectModalComponent />
    </View>
  );
}
