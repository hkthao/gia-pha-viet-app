import React, { useMemo, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Appbar, useTheme, Text, TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useAIChat } from "@/hooks/chat/useAIChat";
import { IMessage } from "@/types";
import { SPACING_SMALL, SPACING_MEDIUM } from "@/constants/dimensions";

export default function AIChatScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { state, actions } = useAIChat();
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
        sendIconInsideTextInput: {
          marginHorizontal: 0,
          width: 40,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
        },
        messageList: {
          padding: SPACING_SMALL,
        },
      }),
    [theme]
  );

  const renderMessage = useCallback(
    ({ item }: { item: IMessage }) => {
      const isMyMessage = item.user._id === 1; // Assuming current user has _id 1
      return (
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessage : styles.otherMessage,
            { alignSelf: isMyMessage ? "flex-end" : "flex-start" },
          ]}
        >
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTime}>
            {item.createdAt
              ? new Date(item.createdAt).toLocaleTimeString()
              : ""}
          </Text>
        </View>
      );
    },
    [styles]
  );
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t("aiChat.title")} />
      </Appbar.Header>
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={state.messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id.toString()}
          style={styles.messageList}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={t("aiChat.typeMessage")}
            value={text}
            onChangeText={setText}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            multiline
            mode="flat"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            right={
              <TextInput.Icon
                icon={() => (
                  <MaterialCommunityIcons
                    name="send"
                    size={20}
                    color={theme.colors.primary}
                  />
                )}
                onPress={() => {
                  if (text.trim().length > 0) {
                    actions.onSend([
                      {
                        _id: Math.round(Math.random() * 1000000).toString(),
                        text: text.trim(),
                        createdAt: new Date(),
                        user: { _id: "1" },
                      },
                    ]);
                    setText("");
                  }
                }}
                disabled={text.trim().length === 0}
                style={styles.sendIconInsideTextInput} // Apply styling for the icon inside TextInput
              />
            }
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
