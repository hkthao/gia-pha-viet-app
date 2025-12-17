import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'; // Removed View
import { Portal, useTheme } from 'react-native-paper'; // Import useTheme
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import ChatInput from './ChatInput';

interface ChatBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
}

const ChatBottomSheet: React.FC<ChatBottomSheetProps> = ({
  isVisible,
  onClose,
  onSendMessage,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const theme = useTheme(); // Get theme object

  // variables
  const snapPoints = useMemo(() => ['40%', '75%', '95%'], []); // Adjusted snap points to be higher

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand(); // Expands to the highest snap point or initial index
    } else {
      bottomSheetRef.current?.close(); // Closes the bottom sheet
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  const styles = StyleSheet.create({ // Moved styles inside component
    handleIndicator: {
      backgroundColor: '#ccc',
    },
    background: {
      backgroundColor: theme.colors.background, // Use theme surface color
    },
    contentContainer: {
      flex: 1,
    },
  });

  return (
    <Portal>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        onClose={onClose}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.background}
        enablePanDownToClose={true} // Allow closing by swiping down
        keyboardBehavior="interactive" // Make the bottom sheet react to keyboard appearance
        keyboardBlurBehavior="restore" // Restore the sheet position when keyboard is dismissed
      >
        <KeyboardAvoidingView // Wrap content with KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <BottomSheetView style={styles.contentContainer}>
            <ChatInput onSendMessage={onSendMessage} multiline={true} />
          </BottomSheetView>
        </KeyboardAvoidingView>
      </BottomSheet>
    </Portal>
  );
};

export default ChatBottomSheet;
