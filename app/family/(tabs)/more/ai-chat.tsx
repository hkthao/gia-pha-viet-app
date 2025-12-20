import React, { useMemo, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Appbar, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useAIChat } from "@/hooks/chat/useAIChat";
import { IMessage } from "@/types";
import { SPACING_SMALL, SPACING_MEDIUM } from "@/constants/dimensions";
import { ChatInput } from "@/components";
import { nanoid } from "nanoid";
import ChatMessageBubble from "@/components/chat/ChatMessageBubble"; // Import the new component

export default function AIChatScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { state, actions } = useAIChat(); // Destructure actions
  const [text, setText] = useState("");

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        chatContainer: {
          flex: 1,
          paddingHorizontal: SPACING_SMALL,
        },
        messageBubble: {
          padding: SPACING_SMALL,
          borderRadius: theme.roundness,
          marginBottom: SPACING_SMALL,
          maxWidth: "80%",
        },
        myMessage: {
          alignSelf: "flex-end",
          backgroundColor: theme.colors.primaryContainer,
        },
        otherMessage: {
          alignSelf: "flex-start",
          backgroundColor: theme.colors.surfaceVariant,
        },
        messageText: {
          color: theme.colors.onSurface,
        },
        messageTime: {
          fontSize: 10,
          color: theme.colors.onSurfaceVariant,
          marginTop: 2,
        },
        inputContainer: {
          marginTop: SPACING_MEDIUM,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.surface,
        },
        textInput: {
          flex: 1,
          minHeight: 40,
          maxHeight: 120, // Limit height for multiline input
          backgroundColor: theme.colors.secondaryContainer,
          borderRadius: theme.roundness,
          color: theme.colors.onSurface,
          marginBottom: 5,
        },

        messageList: {
          padding: SPACING_SMALL,
        },
      }),
    [theme]
  );

  const handleSend = useCallback((message: string) => {
    const newMessage: IMessage = {
      _id: nanoid(),
      text: message,
      createdAt: new Date(),
      user: { _id: "1" }, // Assuming current user has _id "1" as a string
    };
    actions.onSend([newMessage]);
    setText("");
  }, [actions, setText]);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t("aiChat.title")} />
      </Appbar.Header>
      <KeyboardAvoidingView
        style={{ flex: 1 }} // Take remaining space below header
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0} // Adjust as needed
      >
        <View style={styles.chatContainer}>
          {/* Inner View to apply chat-specific padding */}
          <FlatList
            data={state.messages}
            renderItem={({ item }) => <ChatMessageBubble item={item} />}
            keyExtractor={(item) => item._id.toString()}
            style={styles.messageList}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            removeClippedSubviews={false} // May help with focus issues
          />
          <View style={styles.inputContainer}>
            <ChatInput
              placeholder={t("aiChat.typeMessage")}
              value={text}
              onChangeText={setText}
              onSend={handleSend}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
