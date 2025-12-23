import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native'; // Keep StyleSheet from react-native
import { useTheme, TextInput } from 'react-native-paper'; // Import TextInput from react-native-paper
import { SPACING_MEDIUM } from '@/constants/dimensions';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onSend?: (message: string) => void; // Make onSend optional and accept message string
}

const ChatInput: React.FC<ChatInputProps> = memo(({ value, onChangeText, placeholder, onSend }) => {
  const theme = useTheme();
  const styles = StyleSheet.create({
    container: { // Container for the RNP TextInput
      flex: 1,
      minHeight: 44, // Ensures minimum height for multiline input
      maxHeight: 120, // Max height for multiline input
      borderRadius: theme.roundness,
      overflow: 'hidden', // Clip content if it exceeds maxHeight
      marginBottom: 5,
      backgroundColor: theme.colors.secondaryContainer, // Background for the entire input area
    },
    rnpTextInput: { // Specific styles for RNP TextInput inner component
      backgroundColor: theme.colors.secondaryContainer, // Ensure background is applied
      // Remove padding from here as it's handled by RNP TextInput's contentStyle
      // RNP TextInput handles flex: 1 and minHeight/maxHeight internally for multiline
    },
  });

  const renderSendIcon = () => {
    if (onSend) {
      return (
        <TextInput.Icon
          icon="send"
          onPress={() => onSend(value)} // Pass the current value to onSend
          disabled={!value.trim()} // Disable if input is empty
          color={theme.colors.primary}
        />
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <TextInput
        mode="flat" // Use flat mode for cleaner chat input look
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        cursorColor={theme.colors.primary}
        selectionColor={theme.colors.primary}
        spellCheck={false}
        autoCorrect={false}
        underlineColor="transparent" // Remove underline
        activeUnderlineColor="transparent" // Remove active underline
        // Style the input field itself, not the container
        style={styles.rnpTextInput}
        theme={theme}
        // Custom contentStyle to adjust text input area padding
        contentStyle={{ paddingHorizontal: SPACING_MEDIUM }}
        right={renderSendIcon()}
      />
    </View>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;