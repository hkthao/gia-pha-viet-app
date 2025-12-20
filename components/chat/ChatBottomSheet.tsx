import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native'; // Added View
import { Portal, useTheme } from 'react-native-paper'; // Import useTheme (IconButton removed)
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import ChatInput from './ChatInput';
import { SPACING_SMALL } from '@/constants/dimensions'; // Import SPACING_SMALL

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
  const [messageText, setMessageText] = useState(''); // Local state for input text

  // variables
  const snapPoints = useMemo(() => ['40%', '75%', '95%'], []); // Adjusted snap points to be higher

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const handleSend = useCallback(() => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText('');
    }
  }, [messageText, onSendMessage]);

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
      backgroundColor: theme.colors.onSurfaceVariant, // Use theme color
    },
    background: {
      backgroundColor: theme.colors.background, // Use theme surface color
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: SPACING_SMALL,
      paddingBottom: SPACING_SMALL,
    },
    inputContainer: { // Simplified to just wrap ChatInput
      backgroundColor: theme.colors.surface, // Background for the input area
      paddingHorizontal: SPACING_SMALL, // Padding around the chat input
      paddingVertical: SPACING_SMALL / 2, // Vertical padding around the chat input
      borderRadius: theme.roundness,
      marginTop: SPACING_SMALL, // Space above input
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // Adjust as needed
        >
          <BottomSheetView style={styles.contentContainer}>
            <View style={styles.inputContainer}>
              <ChatInput
                placeholder="Type your message..."
                value={messageText}
                onChangeText={setMessageText}
                onSend={handleSend} // Pass the handleSend function
              />
            </View>
          </BottomSheetView>
        </KeyboardAvoidingView>
      </BottomSheet>
    </Portal>
  );
};

ChatBottomSheet.displayName = 'ChatBottomSheet';

export default ChatBottomSheet;
