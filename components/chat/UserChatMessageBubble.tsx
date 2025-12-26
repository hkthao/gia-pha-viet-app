import React, { memo, useMemo, useState, useCallback } from "react";
import { View, StyleSheet, Linking } from "react-native";
import { Text, useTheme, Avatar, List } from "react-native-paper"; // Import List
import { IMessage } from "@/types";
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { getMemberAvatarSource } from '@/utils/imageUtils';
import ImageViewing from 'react-native-image-viewing'; // Import ImageViewing
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
  // const IMAGE_THUMBNAIL_SIZE = 100; // No longer needed

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
      backgroundColor: theme.colors.surfaceVariant,
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
      marginTop: SPACING_SMALL,
      // Removed flexWrap and gap as List.Item handles vertical layout
    },
    listItem: {
      backgroundColor: theme.colors.inversePrimary, // Background for the list item
      borderRadius: theme.roundness,
      marginBottom: SPACING_SMALL / 2, // Space between list items
      paddingVertical: 0, // Compact List.Item
      paddingLeft: SPACING_SMALL
    },
    listItemTitle: {
      color: theme.colors.onSurface,
      fontSize: 14,
      marginLeft: -10
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
              const isImage = attachment.contentType.startsWith('image/');
              const iconName = isImage ? "image" : "file-document-outline";
              const titleText = attachment.fileName || t('common.file');

              return (
                <List.Item
                  key={index}
                  title={titleText}
                  titleStyle={styles.listItemTitle}
                  left={props => <List.Icon {...props} icon={iconName} />}
                  onPress={isImage ? () => handleImagePress(imagesForViewer.findIndex(img => img.uri === attachment.url)) : undefined}
                  style={styles.listItem}
                />
              );
            })}
          </View>
        )}

        {item.location && (
          <List.Item
            title={item.location.address || `${item.location.latitude}, ${item.location.longitude}`}
            titleStyle={styles.listItemTitle}
            left={props => <List.Icon {...props} icon="map-marker" style={{ margin: 0, padding: 0 }} />}
            onPress={item.location && item.location.latitude && item.location.longitude ? () => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${item.location!.latitude},${item.location!.longitude}`) : undefined}
            style={styles.listItem}
          />
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
