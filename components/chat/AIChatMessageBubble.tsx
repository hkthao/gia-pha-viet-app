import React, { memo, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme, Avatar, Button } from "react-native-paper"; // Import Button
import { IMessage } from "@/types";
import { SPACING_MEDIUM, SPACING_SMALL } from "@/constants/dimensions";
import { getAIAvatarSource } from "@/utils/imageUtils";
import { FaceDetectionResultDisplay, GeneratedDataDisplay } from "./"; // Import GeneratedDataDisplay
import { useRouter } from "expo-router"; // Import useRouter
import { useTranslation } from "react-i18next"; // Import useTranslation for button text

const RELATIONSHIP_LOOKUP_INTENT = 'RELATIONSHIP_LOOKUP_PAGE';

interface AIChatMessageBubbleProps {
  item: IMessage;
}

const AIChatMessageBubble: React.FC<AIChatMessageBubbleProps> = memo(
  ({ item }) => {
    const theme = useTheme();
    const router = useRouter(); // Initialize useRouter
    const { t } = useTranslation(); // Initialize useTranslation

    const AVATAR_SIZE = 32;

    const styles = useMemo(
      () =>
        StyleSheet.create({
          messageRow: {
            flexDirection: "row",
            alignItems: "flex-start",
            marginVertical: SPACING_SMALL,
            justifyContent: "flex-start",
            marginLeft: SPACING_SMALL,
          },
          messageBubble: {
            padding: SPACING_MEDIUM,
            borderRadius: theme.roundness,
            maxWidth: "80%",
            minHeight: AVATAR_SIZE,
            justifyContent: "center",
            backgroundColor: theme.colors.surfaceVariant,
          },
          messageText: {
            color: theme.colors.onSurface,
            marginBottom: SPACING_SMALL / 2, // Add some space below text if there are images
          },
          messageTime: {
            fontSize: 10,
            color: theme.colors.onSurfaceVariant,
            marginTop: 2,
            alignSelf: "flex-end",
          },
        }),
      [theme]
    );

    const avatarSource = item.user.avatar
      ? { uri: item.user.avatar }
      : getAIAvatarSource();

    return (
      <View style={styles.messageRow}>
        <Avatar.Image
          size={AVATAR_SIZE}
          source={avatarSource}
          style={{ marginRight: SPACING_MEDIUM }}
        />
        <View style={styles.messageBubble}>
          {item.text && item.text.length > 0 && (
            <Text style={styles.messageText}>{item.text}</Text>
          )}

          {item.faceDetectionResults && item.faceDetectionResults.length > 0 && (
            item.faceDetectionResults.map((faceDetectionResponse, index) => (
              <FaceDetectionResultDisplay
                key={faceDetectionResponse.imageId || index} // Use imageId as key or index as fallback
                faceDetectionResponse={faceDetectionResponse}
              />
            ))
          )}

          {/* New logic for generatedData */}
          {item.generatedData && (
            <GeneratedDataDisplay generatedData={item.generatedData} />
          )}

          {item.intent === RELATIONSHIP_LOOKUP_INTENT && (
            <Button
              mode="contained"
              onPress={() => router.push('/family/more/detect-relationship')} // Adjust path if needed
              style={{ marginVertical: SPACING_SMALL, borderRadius: theme.roundness }}
            >
              {t('chat.detectRelationshipButton')}
            </Button>
          )}

          <Text style={styles.messageTime}>
            {item.createdAt
              ? new Date(item.createdAt).toLocaleTimeString()
              : ""}
          </Text>
        </View>
      </View>
    );
  }
);

AIChatMessageBubble.displayName = "AIChatMessageBubble";

export default AIChatMessageBubble;