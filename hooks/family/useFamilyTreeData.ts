import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore';
import { apiClientWithAuth } from '@/services/api';
import { ApiMemberService } from '@/services/member/api.member.service';
import { ApiRelationshipService } from '@/services/relationship/api.relationship.service';
import { MemberListDto, RelationshipListDto, WindowFamilyTreeData } from '@/types';

interface UseFamilyTreeDataResult {
  members: MemberListDto[];
  relationships: RelationshipListDto[];
  isLoading: boolean;
  error: string | null;
  snackbarVisible: boolean;
  setSnackbarVisible: (visible: boolean) => void;
  familyDetailUrl: string;
  injectedJavaScriptBeforeContentLoaded: string;
}

export const useFamilyTreeData = (): UseFamilyTreeDataResult => {
  const { t } = useTranslation();
  const currentFamilyId = useCurrentFamilyStore((state) => state.currentFamilyId);

  const [members, setMembers] = useState<MemberListDto[]>([]);
  const [relationships, setRelationships] = useState<RelationshipListDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const apiClient = useMemo(() => apiClientWithAuth, []);
  const memberService = useMemo(() => new ApiMemberService(apiClient), [apiClient]);
  const relationshipService = useMemo(() => new ApiRelationshipService(apiClient), [apiClient]);

  useEffect(() => {
    const fetchFamilyTreeData = async () => {
      if (!currentFamilyId) {
        setMembers([]);
        setRelationships([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const membersResult = await memberService.getMembersByFamilyId(currentFamilyId);
        const relationshipsResult = await relationshipService.getRelationshipsByFamilyId(currentFamilyId);

        if (membersResult.isSuccess && membersResult.value) {
          setMembers(membersResult.value);
        } else {
          setError(membersResult.error?.message || t('familyTree.errorLoadingMembers'));
          setSnackbarVisible(true);
        }

        if (relationshipsResult.isSuccess && relationshipsResult.value) {
          setRelationships(relationshipsResult.value);
        } else {
          setError(relationshipsResult.error?.message || t('familyTree.errorLoadingRelationships'));
          setSnackbarVisible(true);
        }
      } catch (err: any) {
        setError(err.message || t('familyTree.errorLoadingData'));
        setSnackbarVisible(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFamilyTreeData();
  }, [currentFamilyId, memberService, relationshipService, t]);

  const familyDetailUrl = currentFamilyId ? `${process.env.EXPO_PUBLIC_APP_BASE_URL}/public/mobile/tree-view` : '';

  const injectedJavaScriptBeforeContentLoaded = useMemo(() => {
    return `
      window.familyTreeData = ${JSON.stringify({
        familyId: currentFamilyId,
        members: members,
        relationships: relationships,
      } as WindowFamilyTreeData)};
      true; // Don't remove this, it's essential for some WebView implementations
    `;
  }, [currentFamilyId, members, relationships]);

  return {
    members,
    relationships,
    isLoading,
    error,
    snackbarVisible,
    setSnackbarVisible,
    familyDetailUrl,
    injectedJavaScriptBeforeContentLoaded,
  };
};