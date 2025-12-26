import React, { memo, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme, Avatar } from "react-native-paper";
import { IMessage } from "@/types";
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { getMemberAvatarSource } from '@/utils/imageUtils';

interface UserChatMessageBubbleProps {
  item: IMessage;
}

const UserChatMessageBubble: React.FC<UserChatMessageBubbleProps> = memo(({ item }) => {
  const theme = useTheme();

  const AVATAR_SIZE = 32;

  const styles = useMemo(() => StyleSheet.create({
    messageRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginVertical: SPACING_SMALL,
      justifyContent: 'flex-end',
      marginRight: SPACING_SMALL,
    },
    messageBubble: {
      padding: SPACING_MEDIUM,
      borderRadius: theme.roundness,
      maxWidth: "80%",
      minHeight: AVATAR_SIZE,
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryContainer,
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
  }), [theme]);

  const avatarSource = item.user.avatar ? { uri: item.user.avatar } : getMemberAvatarSource(null);

  return (
    <View style={styles.messageRow}>
      <View style={styles.messageBubble}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>
          {item.createdAt
            ? new Date(item.createdAt).toLocaleTimeString()
            : ""}
        </Text>
      </View>
      <Avatar.Image size={AVATAR_SIZE} source={avatarSource} style={{ marginLeft: SPACING_MEDIUM }} />
    </View>
  );
});

UserChatMessageBubble.displayName = 'UserChatMessageBubble';

export default UserChatMessageBubble;
