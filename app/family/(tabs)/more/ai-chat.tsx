import React, { useMemo, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Appbar, useTheme, Chip, ActivityIndicator } from "react-native-paper"; // Add Chip, ActivityIndicator
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useAIChat } from "@/hooks/chat/useAIChat";
import { IMessage, ImageUploadResultDto } from "@/types"; // Import ImageUploadResultDto
import { SPACING_SMALL, SPACING_MEDIUM } from "@/constants/dimensions";
import { ChatInput, LoadingOverlay } from "@/components"; // Import LoadingOverlay
import { nanoid } from "nanoid";
import ChatMessageBubble from "@/components/chat/ChatMessageBubble";
import { chatService } from "@/services"; // Import chatService
import ImageViewing from 'react-native-image-viewing'; // Import ImageViewing

// Define a type for local file representation
interface UploadedFile extends ImageUploadResultDto {
  localUri: string;
  type: 'image' | 'pdf'; // Or other types
  isUploading?: boolean;
}

export default function AIChatScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { state, actions } = useAIChat();
  const [text, setText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageViewerIndex, setCurrentImageViewerIndex] = useState(0);

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
        uploadedFilesContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: SPACING_SMALL, // Gap between chips
          justifyContent: 'flex-start',
          alignItems: 'center',
          backgroundColor: theme.colors.surface, // Match input container background
        },
        chip: {
          marginRight: SPACING_SMALL / 2, // Fine tune chip spacing
          backgroundColor: theme.colors.primaryContainer,
          // height: 32, // Fixed height for consistency
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
    actions.onSend([newMessage]);
    setText("");
    // TODO: Also send uploaded files with the message
  }, [actions, setText]);

  const handleImagePicked = useCallback(async (uri: string, base64: string) => {
    const fileName = uri.split('/').pop() || `image-${Date.now()}.jpeg`;
    // For simplicity, assuming all picked files are images and have localUri as the path
    const tempFile: UploadedFile = {
      localUri: uri,
      title: fileName, // Use 'title' instead of 'name'
      type: 'image',
      isUploading: true,
      size: 0, height: 0, width: 0, // Placeholder values, will be updated by API response
    };
    setUploadedFiles((prev) => [...prev, tempFile]);
    setIsUploading(true);

    try {
      // Assuming 'state.familyId' is available in useAIChat or passed as prop
      // For now, hardcode familyId or get it from context if available
      const uploadResult = await chatService.uploadImage(uri, fileName);
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.localUri === uri
            ? { ...file, ...uploadResult, isUploading: false }
            : file
        )
      );
    } catch (error: any) {
      console.error("Upload failed:", error);
      // Remove the failed upload and show error
      setUploadedFiles((prev) => prev.filter((file) => file.localUri !== uri));
      // Optionally show a toast/snackbar
      alert(t('aiChat.uploadErrorMessage'));
    } finally {
      setIsUploading(false);
    }
  }, [t]);

  const handleRemoveFile = useCallback((fileToRemove: UploadedFile) => {
    setUploadedFiles((prev) => prev.filter((file) => file.localUri !== fileToRemove.localUri));
  }, []);

  const handleViewImage = useCallback((file: UploadedFile) => {
    const imageFiles = uploadedFiles.filter(f => f.type === 'image' && f.url);
    const index = imageFiles.findIndex(f => f.url === file.url);
    if (index !== -1) {
      setCurrentImageViewerIndex(index);
      setImageViewerVisible(true);
    }
  }, [uploadedFiles]);

  const imagesForViewer = useMemo(() => {
    return uploadedFiles
      .filter(f => f.type === 'image' && f.url)
      .map(f => ({ uri: f.url! }));
  }, [uploadedFiles]);


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
            <View style={styles.uploadedFilesContainer}>
              {uploadedFiles.map((file) => (
                <Chip
                  key={file.localUri}
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
              ))}
            </View>
          )}

          <View style={styles.inputContainer}>
            <ChatInput
              placeholder={t("aiChat.typeMessage")}
              value={text}
              onChangeText={setText}
              onSend={handleSend}
              onImagePicked={handleImagePicked}
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
