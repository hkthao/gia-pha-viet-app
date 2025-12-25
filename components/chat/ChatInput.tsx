import React, { memo, useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  useTheme,
  TextInput,
  IconButton,
  Menu,
  Divider,
} from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SPACING_MEDIUM, SPACING_SMALL } from "@/constants/dimensions";

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onSend?: (message: string) => void; // Make onSend optional and accept message string
}

const ChatInput: React.FC<ChatInputProps> = memo(
  ({ value, onChangeText, placeholder, onSend }) => {
    const theme = useTheme();
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const openMenu = () => setIsMenuVisible(true);
    const closeMenu = () => setIsMenuVisible(false);

    const handleUpload = () => {
      // TODO: Implement upload functionality
      console.log("Upload image/PDF");
      closeMenu();
    };

    const handleChooseCurrentLocation = () => {
      // TODO: Implement choose current location functionality
      console.log("Choose current location");
      closeMenu();
    };

    const handleChooseLocationFromMap = () => {
      // TODO: Implement choose location from map functionality
      console.log("Choose location from map");
      closeMenu();
    };

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
      menu: {
        marginTop: -40, // Adjust menu position to align with the icon button
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
        <Menu
          visible={isMenuVisible}
          onDismiss={closeMenu}
          anchor={
            <IconButton
              icon={() => (
                <MaterialCommunityIcons
                  name="plus"
                  size={24}
                  color={theme.colors.onSurface}
                />
              )}
              onPress={openMenu}
              style={styles.iconButton}
            />
          }
          style={styles.menu}
        >
          <Menu.Item onPress={handleUpload} title="Tải lên hình ảnh/PDF" />
          <Divider />
          <Menu.Item
            onPress={handleChooseCurrentLocation}
            title="Chọn vị trí hiện tại"
          />
          <Divider />
          <Menu.Item
            onPress={handleChooseLocationFromMap}
            title="Chọn vị trí từ bản đồ"
          />
        </Menu>
        <View style={styles.textInputWrapper}>
          <TextInput
            mode="flat"
            placeholder={placeholder}
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
      </View>
    );
  }
);

ChatInput.displayName = "ChatInput";

export default ChatInput;
