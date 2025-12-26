import React, { useMemo, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Appbar, useTheme, Chip, ActivityIndicator } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useAIChat } from "@/hooks/chat/useAIChat";
import { IMessage } from "@/types";
import { SPACING_SMALL, SPACING_MEDIUM } from "@/constants/dimensions";
import { ChatInput, LoadingOverlay } from "@/components";
import { nanoid } from "nanoid";
import ChatMessageBubble from "@/components/chat/ChatMessageBubble";
import ImageViewing from 'react-native-image-viewing';
import { useAIChatImageUpload } from "@/hooks/chat/useAIChatImageUpload"; // Import useAIChatImageUpload
import { useCurrentFamilyStore } from '@/stores/useCurrentFamilyStore'; // Import useCurrentFamilyStore

export default function AIChatScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { state, actions } = useAIChat();
  const [text, setText] = useState("");

  const { currentFamilyId } = useCurrentFamilyStore();
  const familyId = currentFamilyId || 'default_family_id'; // Fallback to a default or handle appropriately

  const {
    uploadedFiles,
    isUploading,
    imageViewerVisible,
    currentImageViewerIndex,
    imagesForViewer,
    handleImagePicked,
    handleRemoveFile,
    handleViewImage,
    setImageViewerVisible,
    clearUploadedFiles,
  } = useAIChatImageUpload({ familyId });

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
          paddingBottom: Platform.OS === 'ios' ? 0 : 20, // Add padding for Android to prevent keyboard overlap
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
          backgroundColor: theme.colors.surface,
          paddingHorizontal: SPACING_SMALL,
          paddingVertical: SPACING_SMALL,
        },
        textInput: { // This style is for TextInput from RNP, but ChatInput now encapsulates it
          flex: 1,
          minHeight: 40,
          maxHeight: 120,
          backgroundColor: theme.colors.secondaryContainer,
          borderRadius: theme.roundness,
          color: theme.colors.onSurface,
          marginBottom: 5,
        },
        messageList: {
          padding: SPACING_SMALL,
        },
        uploadedFilesFlatList: { // Style for the horizontal FlatList
          maxHeight: 40, // Limit height for chips row
          flexGrow: 0, // Prevent it from taking too much vertical space
          marginBottom: SPACING_SMALL, // Space below chips
        },
        uploadedFilesContentContainer: { // Content container for FlatList
          paddingHorizontal: SPACING_SMALL,
          alignItems: 'center',
          gap: SPACING_SMALL, // Gap between chips
        },
        chip: {
          backgroundColor: theme.colors.primaryContainer,
          height: 32, // Fixed height for consistency
        },
        chipText: {
          color: theme.colors.onPrimaryContainer,
        },
        uploadingIndicator: {
          marginLeft: SPACING_SMALL,
        },
      }),
    [theme]
  );

  const handleSend = useCallback((message: string) => {
    const newMessage: IMessage = {
      _id: nanoid(),
      text: message,
      createdAt: new Date(),
      user: { _id: "1" },
    };
    // Extract only the ImageUploadResultDto part from uploadedFiles
    const attachments = uploadedFiles.filter(f => f.url).map(f => ({
      url: f.url!,
      contentType: f.mimeType || 'application/octet-stream', // Use mimeType for contentType
      fileName: f.title, // Use title for fileName
      fileSize: f.size, // Use size for fileSize
    }));
    actions.onSend([newMessage], attachments);
    setText("");
    clearUploadedFiles(); // Clear uploaded files after sending
  }, [actions, setText, uploadedFiles, clearUploadedFiles]);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t("aiChat.title")} />
      </Appbar.Header>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={styles.chatContainer}>
          <FlatList
            data={state.messages}
            renderItem={({ item }) => <ChatMessageBubble item={item} />}
            keyExtractor={(item) => item._id.toString()}
            style={styles.messageList}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            removeClippedSubviews={false}
          />

          {uploadedFiles.length > 0 && (
            <FlatList
              data={uploadedFiles}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.localUri}
              renderItem={({ item: file }) => (
                <Chip
                  icon={file.type === 'image' ? "image" : "file-pdf-box"}
                  onClose={file.isUploading ? undefined : () => handleRemoveFile(file)}
                  onPress={file.type === 'image' && file.url ? () => handleViewImage(file) : undefined}
                  style={styles.chip}
                  textStyle={styles.chipText}
                  disabled={file.isUploading}
                >
                  {file.title}
                  {file.isUploading && (
                    <ActivityIndicator size="small" color={theme.colors.onPrimaryContainer} style={styles.uploadingIndicator} />
                  )}
                </Chip>
              )}
              style={styles.uploadedFilesFlatList}
              contentContainerStyle={styles.uploadedFilesContentContainer}
            />
          )}

          <View style={styles.inputContainer}>
            <ChatInput
              placeholder={t("aiChat.typeMessage")}
              value={text}
              onChangeText={setText}
              onSend={handleSend}
              onImagePicked={(uri: string) => handleImagePicked(uri)} // Adapt to new hook's signature
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      {imagesForViewer.length > 0 && (
        <ImageViewing
          images={imagesForViewer}
          imageIndex={currentImageViewerIndex}
          visible={imageViewerVisible}
          onRequestClose={() => setImageViewerVisible(false)}
        />
      )}

      <LoadingOverlay isLoading={isUploading} />
    </View>
  );
}
