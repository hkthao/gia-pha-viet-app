import React, { useCallback } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useTheme, Button, Text, IconButton, Card } from 'react-native-paper';
import { MemberItem } from '@/components';
import { SPACING_MEDIUM } from '@/constants/dimensions';
import { MemberListDto } from '@/types';
import { useTranslation } from 'react-i18next';
import { useMemberSelectModal } from '@/hooks/ui/useMemberSelectModal';
import { useRelationshipDetection } from '@/hooks/relationship/useRelationshipDetection'; // Import the new hook

const DEFAULT_MEMBER_A: MemberListDto = {
  id: 'placeholder-A',
  fullName: 'detectRelationship.memberAPlaceholder',
  avatarUrl: '',
  lastName: '',
  firstName: '',
  code: '',
  familyId: '',
  isRoot: false,
  created: '',
};

const DEFAULT_MEMBER_B: MemberListDto = {
  id: 'placeholder-B',
  fullName: 'detectRelationship.memberBPlaceholder',
  avatarUrl: '',
  lastName: '',
  firstName: '',
  code: '',
  familyId: '',
  isRoot: false,
  created: '',
};

export default function DetectRelationshipScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    selectedMember1,
    setSelectedMember1,
    selectedMember2,
    setSelectedMember2,
    relationshipResult,
    loading,
    error,
    handleDetectRelationship,
  } = useRelationshipDetection(DEFAULT_MEMBER_A, DEFAULT_MEMBER_B);

  const { showMemberSelectModal, MemberSelectModal: MemberSelectModalComponent } = useMemberSelectModal<'memberA' | 'memberB'>();

  const handleMemberSelected = useCallback((member: MemberListDto, fieldName: 'memberA' | 'memberB') => {
    if (fieldName === 'memberA') {
      setSelectedMember1(member);
    } else if (fieldName === 'memberB') {
      setSelectedMember2(member);
    }
  }, [setSelectedMember1, setSelectedMember2]);

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
          disabled={loading || selectedMember1.id === DEFAULT_MEMBER_A.id || selectedMember2.id === DEFAULT_MEMBER_B.id}
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