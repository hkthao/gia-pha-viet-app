import React, { memo } from "react";
import { View, StyleSheet } from "react-native"; // Remove Image import
import { Text, useTheme, Avatar } from "react-native-paper"; // Add Avatar import
import { IMessage } from "@/types";
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { getMemberAvatarSource, getAIAvatarSource } from '@/utils/imageUtils';

interface ChatMessageBubbleProps {
  item: IMessage;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = memo(({ item }) => {
  const theme = useTheme();
  const isMyMessage = item.user._id === "1";

  const avatarSource = item.user.avatar
    ? { uri: item.user.avatar }
    : (isMyMessage
      ? getMemberAvatarSource(null)
      : getAIAvatarSource());

  const AVATAR_SIZE = 32; // Define avatar size once

  const styles = StyleSheet.create({
    messageRow: {
      flexDirection: 'row',
      alignItems: 'flex-start', // Align avatars to the top
      marginVertical: SPACING_SMALL / 2,
      // Adjust spacing between avatar and bubble here if needed
      // e.g., paddingHorizontal: SPACING_SMALL,
    },
    myMessageRow: {
      justifyContent: 'flex-end',
      marginRight: SPACING_SMALL, // Space from edge
    },
    otherMessageRow: {
      justifyContent: 'flex-start',
      marginLeft: SPACING_SMALL, // Space from edge
    },
    // Remove individual avatar styling as Avatar.Image handles it
    messageBubble: {
      padding: SPACING_SMALL,
      borderRadius: theme.roundness,
      maxWidth: "70%",
      minHeight: AVATAR_SIZE, // Ensure bubble is at least as tall as avatar
      justifyContent: 'center',
    },
    myMessage: {
      backgroundColor: theme.colors.primaryContainer,
      borderRadius: theme.roundness, // Revert to rounded top right corner
    },
    otherMessage: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.roundness, // Revert to rounded top left corner
    },
    messageText: {
      color: theme.colors.onSurface,
    },
    messageTime: {
      fontSize: 10,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
      alignSelf: 'flex-end',
    },
  });

  return (
    <View style={[styles.messageRow, isMyMessage ? styles.myMessageRow : styles.otherMessageRow]}>
      {!isMyMessage && <Avatar.Image size={AVATAR_SIZE} source={avatarSource} style={{ marginRight: SPACING_MEDIUM}} />}
      <View
        style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>
          {item.createdAt
            ? new Date(item.createdAt).toLocaleTimeString()
            : ""}
        </Text>
      </View>
      {isMyMessage && <Avatar.Image size={AVATAR_SIZE} source={avatarSource} style={{ marginLeft: SPACING_MEDIUM }} />}
    </View>
  );
});

ChatMessageBubble.displayName = 'ChatMessageBubble';

export default ChatMessageBubble;
