import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { Dimensions } from 'react-native';
import { UserListDto, SearchUsersQuery, PaginatedList } from '@/types';
import { userService } from '@/services';
import type { QueryKey } from '@tanstack/react-query';
import { SPACING_SMALL } from '@/constants/dimensions';

const screenHeight = Dimensions.get('window').height;

interface UseUserSelectModalProps {
  onUsersSelected: (users: UserListDto[]) => void;
  onClose: () => void;
  initialSelectedUsers?: UserListDto[];
}

export const useUserSelectModal = ({
  onUsersSelected,
  onClose,
  initialSelectedUsers = [],
}: UseUserSelectModalProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selectedUsers, setSelectedUsers] = useState<UserListDto[]>(initialSelectedUsers);

  const userSearchQueryFn = useCallback(
    async ({ pageParam = 1, filters }: { pageParam?: number; queryKey: QueryKey; filters: SearchUsersQuery }): Promise<PaginatedList<UserListDto>> => {
      const paginatedList = await userService.search({ ...filters, page: pageParam });
      return paginatedList;
    },
    []
  );

  const getUserSearchQueryKey = useCallback((filters: SearchUsersQuery): QueryKey => {
    return ['users', 'modalSearch', filters];
  }, []);

  const initialQuery: SearchUsersQuery = useMemo(() => ({
    searchQuery: '',
  }), []);

  const handleUserToggle = useCallback((user: UserListDto) => {
    setSelectedUsers((prevSelected) => {
      if (prevSelected.some((u) => u.id === user.id)) {
        return prevSelected.filter((u) => u.id !== user.id);
      } else {
        return [...prevSelected, user];
      }
    });
  }, []);

  const handleConfirmSelection = useCallback(() => {
    onUsersSelected(selectedUsers);
    onClose();
  }, [onUsersSelected, selectedUsers, onClose]);

  const containerStyle = useMemo(() => ({
    padding: SPACING_SMALL,
    borderRadius: theme.roundness,
    flex: 1,
  }), [theme]);

  const modalStyle = useMemo(() => ({
    backgroundColor: theme.colors.background
  }), [theme]);

  return {
    userSearchQueryFn,
    getUserSearchQueryKey,
    initialQuery,
    handleUserToggle,
    handleConfirmSelection,
    selectedUsers,
    containerStyle,
    modalStyle,
    screenHeight,
    t,
  };
};