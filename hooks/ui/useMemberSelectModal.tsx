import { useState, useCallback, useMemo } from 'react';
import { MemberListDto } from '@/types';
import MemberSelectModalComponent from '@/components/member/MemberSelectModal'; // Import the moved component


// -----------------------------------------------------------------------------
// useMemberSelectModal Hook
// -----------------------------------------------------------------------------
interface UseMemberSelectModal<TFieldName extends string> {
  showMemberSelectModal: (onSelect: (member: MemberListDto, fieldName: TFieldName) => void, fieldName: TFieldName) => void;
  MemberSelectModal: React.FC;
}

export function useMemberSelectModal<TFieldName extends string>(): UseMemberSelectModal<TFieldName> {
  const [isVisible, setIsVisible] = useState(false);
  const [selectCallback, setSelectCallback] = useState<(member: MemberListDto, fieldName: TFieldName) => void>(() => () => { });
  const [currentFieldName, setCurrentFieldName] = useState<TFieldName | undefined>(undefined);

  const showMemberSelectModal = useCallback(
    (onSelect: (member: MemberListDto, fieldName: TFieldName) => void, fieldName: TFieldName) => {
      setSelectCallback(() => onSelect);
      setCurrentFieldName(fieldName);
      setIsVisible(true);
    },
    []
  );

  const hideModal = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleSelectMember = useCallback(
    (member: MemberListDto, fieldName: TFieldName) => {
      selectCallback(member, fieldName);
      hideModal();
    },
    [selectCallback, hideModal]
  );

  const MemoizedMemberSelectModal = useMemo(() => {
    const Component: React.FC = () => {
      if (currentFieldName === undefined) {
        return null;
      }
      return (
        <MemberSelectModalComponent<TFieldName>
          isVisible={isVisible}
          onClose={hideModal}
          onSelectSingleMember={handleSelectMember}
          fieldName={currentFieldName}
          multiSelect={false}
        />
      );
    };
    return Component;
  }, [isVisible, hideModal, handleSelectMember, currentFieldName]);

  return {
    showMemberSelectModal,
    MemberSelectModal: MemoizedMemberSelectModal,
  };
}