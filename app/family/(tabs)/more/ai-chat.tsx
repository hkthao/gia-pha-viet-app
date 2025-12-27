import React, { useMemo, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Appbar, useTheme, Chip, ProgressBar } from "react-native-paper"; // Import ProgressBar
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useAIChat } from "@/hooks/chat/useAIChat";
import { IMessage, ChatLocationDto } from "@/types"; // Import ChatLocationDto
import { SPACING_SMALL, SPACING_MEDIUM } from "@/constants/dimensions";
import { ChatInput } from "@/components";
import { nanoid } from "nanoid";
import ChatMessageBubble from "@/components/chat/ChatMessageBubble";
import ImageViewing from "react-native-image-viewing";
import { useAIChatImageUpload } from "@/hooks/chat/useAIChatImageUpload"; // Import useAIChatImageUpload
import { useCurrentFamilyStore } from "@/stores/useCurrentFamilyStore"; // Import useCurrentFamilyStore
import AITypingIndicator from "@/components/chat/AITypingIndicator"; // Import AITypingIndicator

export default function AIChatScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { state, actions } = useAIChat();
  const [text, setText] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<ChatLocationDto | null>(null); // New state for selected location

  const { currentFamilyId } = useCurrentFamilyStore();
  const familyId = currentFamilyId || "default_family_id"; // Fallback to a default or handle appropriately

  const {
    uploadedFiles,
    isAnyFileUploading, // Access isAnyFileUploading
    imageViewerVisible,
    currentImageViewerIndex,
    imagesForViewer,
    handleImagePicked,
    handleRemoveFile,
    handleViewImage,
    setImageViewerVisible,
    clearUploadedFiles,
  } = useAIChatImageUpload({ familyId });

  // Destructure isLoadingAIResponse from state
  const { isLoadingAIResponse } = state;

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
          paddingBottom: Platform.OS === "ios" ? 0 : 20, // Add padding for Android to prevent keyboard overlap
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
        textInput: {
          // This style is for TextInput from RNP, but ChatInput now encapsulates it
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
        uploadedFilesFlatList: {
          // Style for the horizontal FlatList
          maxHeight: 40, // Limit height for chips row
          flexGrow: 0, // Prevent it from taking too much vertical space
          marginBottom: SPACING_SMALL, // Space below chips
        },
        uploadedFilesContentContainer: {
          // Content container for FlatList
          paddingHorizontal: SPACING_SMALL,
          alignItems: "center",
          gap: SPACING_SMALL, // Gap between chips
        },
        chip: {
          backgroundColor: theme.colors.primaryContainer,
          height: 32, // Fixed height for consistency
        },
        chipText: {
          color: theme.colors.onPrimaryContainer,
        },
        uploadingIndicator: { // This style is no longer needed for chips, but kept for general reference
          marginLeft: SPACING_SMALL,
        },
        fileItem: {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        },
        progressBar: {
          marginHorizontal: SPACING_SMALL,
        },
        selectedLocationContainer: {
          paddingHorizontal: SPACING_SMALL,
          flexDirection: 'row', // To align chip properly
          justifyContent: 'flex-start',
        },
      }),
    [theme]
  );

  const handleLocationSelected = useCallback((location: ChatLocationDto) => {
    setSelectedLocation(location);
  }, []);

  const handleSend = useCallback(
    (message: string) => {
      // Extract only the ImageUploadResultDto part from uploadedFiles
      const attachments = uploadedFiles
        .filter((f) => f.url)
        .map((f) => ({
          url: f.url!,
          contentType: f.mimeType || "application/octet-stream", // Use mimeType for contentType
          fileName: f.title, // Use title for fileName
          fileSize: f.size, // Use size for fileSize
          width: f.width,   // Add width
          height: f.height, // Add height
        }));

      const newMessage: IMessage = {
        _id: nanoid(),
        text: message,
        createdAt: new Date(),
        user: { _id: "1" },
        attachments: attachments, // Add attachments here
        location: selectedLocation, // Add selected location here
      };
      actions.onSend([newMessage]); // Pass only newMessage, attachments are already inside
      setText("");
      clearUploadedFiles(); // Clear uploaded files after sending
      setSelectedLocation(null); // Clear selected location after sending
    },
    [actions, setText, uploadedFiles, clearUploadedFiles, selectedLocation]
  );

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
          {isLoadingAIResponse && (
            <AITypingIndicator />
          )}

          {uploadedFiles.length > 0 && (
            <FlatList
              data={uploadedFiles}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.localUri}
              renderItem={({ item: file }) => (
                <View style={styles.fileItem}>
                  <Chip
                    icon={file.type === "image" ? "image" : "file-pdf-box"}
                    onClose={
                      file.isUploading
                        ? undefined
                        : () => handleRemoveFile(file)
                    }
                    onPress={
                      file.type === "image" && file.url
                        ? () => handleViewImage(file)
                        : undefined
                    }
                    style={styles.chip}
                    textStyle={styles.chipText}
                    disabled={file.isUploading}
                  >
                    {file.title}
                  </Chip>
                  {/* Removed individual ActivityIndicator from here */}
                </View>
              )}
              style={styles.uploadedFilesFlatList}
              contentContainerStyle={styles.uploadedFilesContentContainer}
            />
          )}

          {isAnyFileUploading && (
            <ProgressBar indeterminate color={theme.colors.primary} style={styles.progressBar} />
          )}

          {selectedLocation && (
            <View style={styles.selectedLocationContainer}>
              <Chip
                icon="map-marker"
                onClose={() => setSelectedLocation(null)}
                style={styles.chip} // Reusing chip style for consistency
                textStyle={styles.chipText} // Reusing chip text style
              >
                {t('chatInput.currentLocation')} {/* "Vị trí hiện tại" */}
              </Chip>
            </View>
          )}

          <View style={styles.inputContainer}>
            <ChatInput
              placeholder={t("aiChat.typeMessage")}
              value={text}
              onChangeText={setText}
              onSend={handleSend}
              onImagePicked={(uri: string) => handleImagePicked(uri)} // Adapt to new hook's signature
              onLocationSelected={handleLocationSelected} // Pass the new callback
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


    </View>
  );
}
