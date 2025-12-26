import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import {
  useTheme,
  TextInput,
  IconButton,
  Dialog,
  Portal,
  List,
  Text,
} from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SPACING_MEDIUM, SPACING_SMALL } from "@/constants/dimensions";
import { useChatInputActions } from "@/hooks/chat/useChatInputActions"; // Import the custom hook
import { ChatLocationDto } from "@/types"; // Import ChatLocationDto

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onSend?: (message: string) => void; // Make onSend optional and accept message string
  onImagePicked: (uri: string) => void; // New prop for image data
  onLocationSelected: (location: ChatLocationDto) => void; // New prop for location data
}

const ChatInput: React.FC<ChatInputProps> = memo(
  ({ value, onChangeText, placeholder, onSend, onImagePicked, onLocationSelected }) => {
    const theme = useTheme();
    const {
      isDialogVisible,
      showDialog,
      hideDialog,
      handleChooseFromLibrary,
      handleTakePhoto,
      handleChooseCurrentLocation,
      handleChooseLocationFromMap,
      t, // Get t from the hook
    } = useChatInputActions(onImagePicked, onLocationSelected); // Pass onImagePicked and onLocationSelected to the hook

    const styles = StyleSheet.create({
      container: {
        flexDirection: "row", // Arrange children horizontally
        alignItems: "flex-end", // Align items to the bottom
        minHeight: 44,
        maxHeight: 120,
        borderRadius: theme.roundness,
        marginBottom: 5,
        backgroundColor: theme.colors.secondaryContainer,
        paddingHorizontal: SPACING_MEDIUM, // Add horizontal padding to the container
      },
      textInputWrapper: {
        // New wrapper for TextInput to take remaining space
        flex: 1,
        // Remove padding from here as it's handled by RNP TextInput's contentStyle
        // RNP TextInput handles flex: 1 and minHeight/maxHeight internally for multiline
      },
      rnpTextInput: {
        backgroundColor: theme.colors.secondaryContainer,
        // Remove padding from here as it's handled by RNP TextInput's contentStyle
      },
      iconButton: {
        marginLeft: -SPACING_SMALL,
        marginRight: SPACING_MEDIUM / 2, // Spacing between icon and text input
        marginBottom: 8, // Adjust to align with text input vertically
      },
    });

    const renderSendIcon = () => {
      if (onSend) {
        return (
          <TextInput.Icon
            icon="send"
            onPress={() => onSend(value)}
            disabled={!value.trim()}
            color={theme.colors.primary}
          />
        );
      }
      return null;
    };

    return (
      <View style={styles.container}>
        <IconButton
          icon={() => (
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color={theme.colors.onSurface}
            />
          )}
          onPress={showDialog}
          style={styles.iconButton}
        />
        <View style={styles.textInputWrapper}>
          <TextInput
            mode="flat"
            placeholder={t(placeholder)}
            value={value}
            onChangeText={onChangeText}
            cursorColor={theme.colors.primary}
            selectionColor={theme.colors.primary}
            spellCheck={false}
            autoCorrect={false}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            style={styles.rnpTextInput}
            theme={theme}
            contentStyle={{ paddingHorizontal: SPACING_MEDIUM }}
            right={renderSendIcon()}
          />
        </View>

        <Portal>
          <Dialog
            visible={isDialogVisible}
            onDismiss={hideDialog}
            style={{ borderRadius: theme.roundness }}
          >
            <Dialog.Content>
              <List.Item
                title={t("chatInput.takePhoto")}
                left={() => <List.Icon icon="camera" />}
                onPress={handleTakePhoto}
              />
              <List.Item
                title={t("chatInput.chooseFromLibrary")}
                left={() => <List.Icon icon="image-multiple" />}
                onPress={handleChooseFromLibrary}
              />
              <List.Item
                title={t("chatInput.chooseCurrentLocation")}
                left={() => <List.Icon icon="map-marker" />}
                onPress={handleChooseCurrentLocation}
              />
              <List.Item
                title={t("chatInput.chooseLocationFromMap")}
                left={() => <List.Icon icon="map" />}
                onPress={handleChooseLocationFromMap}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Text onPress={hideDialog}>{t("common.cancel")}</Text>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    );
  }
);

ChatInput.displayName = "ChatInput";

export default ChatInput;
