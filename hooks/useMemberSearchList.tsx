import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Chip, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import DefaultFamilyAvatar from '@/assets/images/familyAvatar.png';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { usePublicMemberStore } from '@/stores/usePublicMemberStore';
import { Gender, MemberListDto, SearchPublicMembersQuery } from '@/types';
import { ZustandPaginatedStore } from '@/hooks/usePaginatedSearch';

interface UseMemberSearchListHook {
  useStore: () => ZustandPaginatedStore<MemberListDto, SearchPublicMembersQuery>;
  renderMemberItem: ({ item }: { item: MemberListDto }) => React.JSX.Element;
  styles: ReturnType<typeof getStyles>;
  t: (key: string) => string;
  router: ReturnType<typeof useRouter>;
  currentFamilyId: string | null;
}

const getStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING_SMALL,
  },
  memberCard: {
    marginBottom: SPACING_MEDIUM,
    marginHorizontal: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    marginRight: SPACING_MEDIUM,
  },
  cardText: {
    flex: 1,
  },
  memberDetailsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: -SPACING_MEDIUM,
  },
  detailChip: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    borderWidth: 0,
  },
});

export function useMemberSearchList(): UseMemberSearchListHook {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const currentFamilyId = useFamilyStore((state) => state.currentFamilyId);
  const styles = useMemo(() => getStyles(theme), [theme]);

  // Define useStore function for usePaginatedSearch
  const useStore = useCallback(() => {
    const { members, loading, error, hasMore, page: currentPage, fetchMembers, reset, setError } = usePublicMemberStore();
    return useMemo(() => ({
      items: members,
      loading,
      error,
      hasMore,
      page: currentPage,
      fetch: async (query: SearchPublicMembersQuery, isLoadMore: boolean) => {
        if (!currentFamilyId) {
          setError(t('memberSearch.errors.noFamilyId'));
          return null;
        }
        return fetchMembers({ ...query, familyId: currentFamilyId }, isLoadMore);
      },
      reset,
      setError,
    }), [currentFamilyId, t, members, loading, error, hasMore, currentPage, fetchMembers, reset, setError]);
  }, [currentFamilyId, t]);

  const renderMemberItem = useCallback(({ item }: { item: MemberListDto }) => (
    <Card style={[styles.memberCard, { borderRadius: theme.roundness }]} onPress={() => {
      router.push(`/member/${item.id}`);
    }}>
      <Card.Content style={styles.cardContent}>
        <Avatar.Image size={48} source={item.avatarUrl ? { uri: item.avatarUrl } : DefaultFamilyAvatar} style={styles.avatar} />
        <View style={styles.cardText}>
          <Text variant="titleMedium">{item.fullName}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING_SMALL / 2 }}>
            {item.occupation && <Text variant="bodySmall">{item.occupation}</Text>}
            {item.occupation && item.birthDeathYears && <Text variant="bodySmall">|</Text>}
            {item.birthDeathYears && <Text variant="bodySmall">{item.birthDeathYears}</Text>}
          </View>
          <View style={styles.memberDetailsChips}>
            {item.gender && (
              <Chip icon="gender-male-female" style={styles.detailChip} compact={true}>
                {t(`memberSearch.filter.gender.${item.gender.toLowerCase()}`)}
              </Chip>
            )}
            {item.fatherFullName && (
              <Chip icon="human-male-boy" style={styles.detailChip} compact={true} >
                {item.fatherFullName}
              </Chip>
            )}
            {item.motherFullName && (
              <Chip icon="human-female-girl" style={styles.detailChip} compact={true} >
                {item.motherFullName}
              </Chip>
            )}
            {item.wifeFullName && (
              <Chip icon="heart" style={styles.detailChip} compact={true} >
                {item.wifeFullName}
              </Chip>
            )}
            {item.husbandFullName && (
              <Chip icon="heart" style={styles.detailChip} compact={true} >
                {item.husbandFullName}
              </Chip>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  ), [router, t, theme, styles.memberCard, styles.cardContent, styles.avatar, styles.cardText, styles.detailChip, styles.memberDetailsChips]);

  return {
    useStore,
    renderMemberItem,
    styles,
    t,
    router,
    currentFamilyId,
  };
}