import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  placeholder,
  multiline = false,
}) => {
  const [message, setMessage] = useState('');
  const theme = useTheme();
  const { t } = useTranslation();

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <TextInput
        mode="outlined"
        placeholder={placeholder || t('chat.typeMessage')}
        value={message}
        onChangeText={setMessage}
        style={styles.textInput}
        multiline={multiline}
        right={
          <TextInput.Icon
            icon="send"
            onPress={handleSendMessage}
            disabled={!message.trim()}
          />
        }
      />
      {/* <Button
        mode="contained"
        onPress={handleSendMessage}
        disabled={!message.trim()}
        style={styles.sendButton}
        labelStyle={styles.sendButtonLabel}
      >
        {t('chat.send')}
      </Button> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    marginRight: 8,
    minHeight: 40,
    maxHeight: 120, // Limit height for multiline input
  },
  sendButton: {
    borderRadius: 20, // Rounded button
  },
  sendButtonLabel: {
    paddingHorizontal: 8,
  },
});

export default ChatInput;
