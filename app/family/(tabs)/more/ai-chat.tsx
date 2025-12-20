import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { GiftedChat } from 'react-native-gifted-chat';
import { useAIChat } from '@/hooks/chat/useAIChat';

export default function AIChatScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { state, actions } = useAIChat();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    chatContainer: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('aiChat.title')} />
      </Appbar.Header>
      <GiftedChat
        messages={state.messages}
        onSend={actions.onSend}
        user={{
          _id: 1,
        }}
        isInverted={true}
        textInputProps={{
          style: {
            backgroundColor: theme.colors.surface,
            color: theme.colors.onSurface,
          },
        }}
        messagesContainerStyle={{
          backgroundColor: theme.colors.background,
        }}
      />
    </View>
  );
}
