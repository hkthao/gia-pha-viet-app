import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { Dimensions } from 'react-native';
import { MemberListDto, SearchMembersQuery, PaginatedList } from '@/types';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { memberService } from '@/services';
import type { QueryKey } from '@tanstack/react-query';
import { SPACING_SMALL } from '@/constants/dimensions';

const screenHeight = Dimensions.get('window').height;

interface UseMemberSelectModalProps<TFieldName extends string> {
  onSelectMember: (member: MemberListDto, fieldName: TFieldName) => void;
  fieldName: TFieldName;
  onClose: () => void;
}

export const useMemberSelectModal = <TFieldName extends string>({
  onSelectMember,
  fieldName,
  onClose,
}: UseMemberSelectModalProps<TFieldName>) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);

  const memberSearchQueryFn = useCallback(
    async ({ pageParam = 1, filters }: { pageParam?: number; queryKey: QueryKey; filters: SearchMembersQuery }): Promise<PaginatedList<MemberListDto>> => {
      if (!currentFamilyId) {
        return { items: [], page: 1, totalPages: 0, totalItems: 0 };
      }
      const result = await memberService.search({ ...filters, familyId: currentFamilyId, page: pageParam });
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(result.error?.message || t('memberSearch.errors.unknown'));
    },
    [currentFamilyId, t]
  );

  const getMemberSearchQueryKey = useCallback((filters: SearchMembersQuery): QueryKey => {
    return ['members', 'modalSearch', currentFamilyId, filters];
  }, [currentFamilyId]);

  const initialQuery: SearchMembersQuery = useMemo(() => ({
    searchQuery: '',
    gender: undefined,
    isRoot: undefined,
    familyId: currentFamilyId || '',
  }), [currentFamilyId]);

  const handleMemberPress = useCallback((member: MemberListDto) => {
    onSelectMember(member, fieldName);
    onClose();
  }, [onSelectMember, onClose, fieldName]);

  const containerStyle = useMemo(() => ({
    padding: SPACING_SMALL,
    borderRadius: theme.roundness,
    flex: 1,
  }), [theme]);

  const modalStyle = useMemo(() => ({
    backgroundColor: theme.colors.background
  }), [theme]);

  return {
    memberSearchQueryFn,
    getMemberSearchQueryKey,
    initialQuery,
    handleMemberPress,
    containerStyle,
    modalStyle,
    currentFamilyId,
    screenHeight,
    t,
  };
};