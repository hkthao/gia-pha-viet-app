import React, { memo, useMemo, useState, useCallback } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Dimensions } from "react-native";
import { Text, useTheme, Avatar } from "react-native-paper";
import { IMessage } from "@/types";
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { getMemberAvatarSource } from '@/utils/imageUtils';
import ImageViewing from 'react-native-image-viewing'; // Import ImageViewing
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"; // Import MaterialCommunityIcons
import { useTranslation } from 'react-i18next'; // Import useTranslation

interface UserChatMessageBubbleProps {
  item: IMessage;
}

const UserChatMessageBubble: React.FC<UserChatMessageBubbleProps> = memo(({ item }) => {
  const theme = useTheme();
  const { t } = useTranslation(); // Initialize useTranslation
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageViewerIndex, setCurrentImageViewerIndex] = useState(0);

  const AVATAR_SIZE = 32;
  const IMAGE_THUMBNAIL_SIZE = 100;

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
      backgroundColor: theme.colors.primaryContainer,
    },
    messageText: {
      color: theme.colors.onSurface,
      marginBottom: SPACING_SMALL / 2, // Space between text and attachments/location
    },
    messageTime: {
      fontSize: 10,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
      alignSelf: 'flex-end',
    },
    attachmentsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: SPACING_SMALL,
    },
    imageThumbnail: {
      width: IMAGE_THUMBNAIL_SIZE,
      height: IMAGE_THUMBNAIL_SIZE,
      borderRadius: theme.roundness,
      marginRight: SPACING_SMALL,
      marginBottom: SPACING_SMALL,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING_SMALL,
      padding: SPACING_SMALL,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness,
    },
    locationText: {
      marginLeft: SPACING_SMALL,
      color: theme.colors.onSurface,
    },
    fileAttachment: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING_SMALL,
      padding: SPACING_SMALL,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness,
    },
    fileText: {
      marginLeft: SPACING_SMALL,
      color: theme.colors.onSurface,
      flexShrink: 1, // Allow text to wrap
    },
  }), [theme]);

  const avatarSource = item.user.avatar ? { uri: item.user.avatar } : getMemberAvatarSource(null);

  const imagesForViewer = useMemo(() => {
    return item.attachments
      ?.filter(att => att.contentType.startsWith('image/') && att.url)
      .map(att => ({ uri: att.url! })) || [];
  }, [item.attachments]);

  const handleImagePress = useCallback((index: number) => {
    setCurrentImageViewerIndex(index);
    setImageViewerVisible(true);
  }, []);

  return (
    <View style={styles.messageRow}>
      <View style={styles.messageBubble}>
        <Text style={styles.messageText}>{item.text}</Text>

        {item.attachments && item.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {item.attachments.map((attachment, index) => {
              if (attachment.contentType.startsWith('image/')) {
                return (
                  <TouchableOpacity key={index} onPress={() => handleImagePress(index)}>
                    <Image source={{ uri: attachment.url }} style={styles.imageThumbnail} />
                  </TouchableOpacity>
                );
              } else {
                return (
                  <View key={index} style={styles.fileAttachment}>
                    <MaterialCommunityIcons name="file-document-outline" size={20} color={theme.colors.onSurface} />
                    <Text style={styles.fileText}>{attachment.fileName || t('common.file')}</Text>
                  </View>
                );
              }
            })}
          </View>
        )}

        {item.location && (
          <View style={styles.locationContainer}>
            <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.onSurface} />
            <Text style={styles.locationText}>
              {item.location.address || `${item.location.latitude}, ${item.location.longitude}`}
            </Text>
          </View>
        )}

        <Text style={styles.messageTime}>
          {item.createdAt
            ? new Date(item.createdAt).toLocaleTimeString()
            : ""}
        </Text>
      </View>
      <Avatar.Image size={AVATAR_SIZE} source={avatarSource} style={{ marginLeft: SPACING_MEDIUM }} />

      {imagesForViewer.length > 0 && (
        <ImageViewing
          images={imagesForViewer}
          imageIndex={currentImageViewerIndex}
          visible={imageViewerVisible}
          onRequestClose={() => setImageViewerVisible(false)}
        />
      )}
    </View>
  );
});

UserChatMessageBubble.displayName = 'UserChatMessageBubble';

export default UserChatMessageBubble;
