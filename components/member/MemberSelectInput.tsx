import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, IconButton, Text, useTheme } from 'react-native-paper'; // Added Text
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { memberService } from '@/services';
import type { MemberDetailDto, MemberListDto } from '@/types/member'; // Added MemberListDto
import { SPACING_MEDIUM } from '@/constants/dimensions';
import MemberSelectModalComponent from './MemberSelectModal'; // Updated import alias

interface MemberSelectInputProps {
  memberId?: string | null;
  label?: string;
  onMemberSelected: (memberId: string | null, memberName: string | null) => void;
  error?: boolean;
  helperText?: string;
  fieldName: string; // Added fieldName prop
}

const MemberSelectInput: React.FC<MemberSelectInputProps> = ({
  memberId,
  label,
  onMemberSelected,
  error,
  helperText,
  fieldName, // Destructure new prop
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [_displayedMemberName, setDisplayedMemberName] = useState('');

  const { data, isLoading, isError } = useQuery<MemberDetailDto, Error>({
    queryKey: ['member', memberId],
    queryFn: async () => {
      if (!memberId) {
        throw new Error('Member ID is required for fetching details.');
      }
      const result = await memberService.getById(memberId);
      if (result.isSuccess && result.value) {
        return result.value;
      } else {
        throw new Error(result.error?.message || t('common.errorFetchingDetails'));
      }
    },
    enabled: !!memberId, // Only run query if memberId is present
    staleTime: Infinity, // Keep data fresh
  });

  // Update displayed name when query data changes
  useEffect(() => {
    if (!isLoading && !isError) {
      setDisplayedMemberName(data?.fullName || '');
    } else if (isLoading) {
      setDisplayedMemberName(t('common.loading'));
    } else if (isError) {
      setDisplayedMemberName(t('common.error'));
    } else {
      setDisplayedMemberName(''); // Clear if no memberId and not loading/error
    }
  }, [data, isLoading, isError, t]);

  const handleOpenModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleMemberSelectedFromModal = useCallback((member: MemberListDto, selectedFieldName: string) => {
    if (selectedFieldName === fieldName) {
      onMemberSelected(member.id, member.fullName);
      setDisplayedMemberName(member.fullName); // Immediately update displayed name
    }
    setModalVisible(false);
  }, [onMemberSelected, fieldName]);

  // If memberId is null, clear the input
  useEffect(() => {
    if (memberId === null) {
      onMemberSelected(null, null); // Clear the internal state of the parent form
      setDisplayedMemberName(''); // Clear displayed name
    }
  }, [memberId, onMemberSelected]);


  const styles = StyleSheet.create({
    container: {
    },
    input: {
      backgroundColor: theme.colors.surface,
    },
  });

  return (
    <View style={styles.container}>
      <TextInput
        label={label || t('memberSelectInput.selectMember')}
        value={_displayedMemberName}
        mode="outlined"
        readOnly
        right={
          <TextInput.Icon
            icon="chevron-down"
            onPress={handleOpenModal}
          />
        }
        error={error}
        style={styles.input}
      />
      {helperText && error && <Text style={{ color: theme.colors.error }}>{helperText}</Text>}

      <MemberSelectModalComponent
        isVisible={modalVisible}
        onClose={handleCloseModal}
        onSelectMember={handleMemberSelectedFromModal}
        fieldName={fieldName} // Pass fieldName to the modal
      />
    </View>
  );
};

export default MemberSelectInput;
