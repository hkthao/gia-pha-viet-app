import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { relationshipService } from '@/services';
import { DetectRelationshipResult, MemberListDto } from '@/types';
import { useCurrentFamilyId } from '@/hooks/family/useCurrentFamilyId';

interface RelationshipDetectionState {
  selectedMember1: MemberListDto;
  selectedMember2: MemberListDto;
  relationshipResult: DetectRelationshipResult | null;
  loading: boolean;
  error: string | null;
}

export interface UseRelationshipDetectionResult extends RelationshipDetectionState {
  setSelectedMember1: (member: MemberListDto) => void;
  setSelectedMember2: (member: MemberListDto) => void;
  handleDetectRelationship: () => Promise<void>;
  resetSelection: () => void;
}

export function useRelationshipDetection(
  defaultMemberA: MemberListDto,
  defaultMemberB: MemberListDto
): UseRelationshipDetectionResult {
  const { t } = useTranslation();
  const currentFamilyId = useCurrentFamilyId();

  const [selectedMember1, setSelectedMember1] = useState<MemberListDto>(defaultMemberA);
  const [selectedMember2, setSelectedMember2] = useState<MemberListDto>(defaultMemberB);
  const [relationshipResult, setRelationshipResult] = useState<DetectRelationshipResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDetectRelationship = useCallback(async () => {
    if (!selectedMember1?.id || !selectedMember2?.id || !currentFamilyId) {
      setError(t('detectRelationship.validationError'));
      return;
    }

    setLoading(true);
    setError(null);
    setRelationshipResult(null);

    try {
      const result = await relationshipService.detectRelationship(
        currentFamilyId,
        selectedMember1.id,
        selectedMember2.id
      );
      setRelationshipResult(result);
    } catch (e: any) {
      setError(e.message || t('detectRelationship.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [selectedMember1, selectedMember2, currentFamilyId, t]);

  const resetSelection = useCallback(() => {
    setSelectedMember1(defaultMemberA);
    setSelectedMember2(defaultMemberB);
    setRelationshipResult(null);
    setError(null);
    setLoading(false);
  }, [defaultMemberA, defaultMemberB]);

  return {
    selectedMember1,
    setSelectedMember1,
    selectedMember2,
    setSelectedMember2,
    relationshipResult,
    loading,
    error,
    handleDetectRelationship,
    resetSelection,
  };
}
