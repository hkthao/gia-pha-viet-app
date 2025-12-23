import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Text,
  Button,
  Switch,
  Avatar,
  useTheme,
  Appbar,
  List,
  Divider,
} from "react-native-paper";
import { useTranslation } from "react-i18next";
import { SPACING_MEDIUM } from "@/constants/dimensions";
import { useAuth } from "@/hooks/auth/useAuth";
import { router } from "expo-router";
import { useEffect, useMemo } from "react"; // Removed useState
import * as Application from 'expo-application'; // Import Application
// import { useThemeContext } from '@/context/ThemeContext'; // Removed useThemeContext
import FamilyAvatar from "@/assets/images/familyAvatar.png"; // Import the default avatar image
import { useGetCurrentUserProfileQuery } from "@/hooks/user/useUserProfileQueries"; // Import user profile query
import { useAppSettings } from "@/hooks/settings/useAppSettings"; // Import the new hook
import { defaultStorageService } from "@/services/storageService"; // Import defaultStorageService

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { logout, isLoggedIn } = useAuth();
  const theme = useTheme();

  const {
    state: { isDarkMode, currentLanguage }, // Destructure from useAppSettings state
    actions: { toggleTheme, changeLanguage }, // Destructure from useAppSettings actions
  } = useAppSettings({ i18n, storageService: defaultStorageService }); // Pass i18n instance and storageService

  const {
    data: fetchedUserProfile,
    isLoading: loadingProfile,
    error: errorProfile,
    refetch: refetchUserProfile,
  } = useGetCurrentUserProfileQuery();

  useEffect(() => {
    if (isLoggedIn) {
      refetchUserProfile();
    }
  }, [isLoggedIn, refetchUserProfile]);

  const handleLogout = () => {
    Alert.alert(
      t("settings.logout.confirmTitle"),
      t("settings.logout.confirmMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.logout"),
          onPress: () => {
            logout();
            router.replace("/login"); // Redirect to login after logout
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  const handleEditProfile = () => {
    if (isLoggedIn) {
      // Navigate to edit profile screen
    } else {
      router.push("/login"); // Navigate to login if not logged in
    }
  };

  // const handleDeleteAccount = () => {
  //   Alert.alert(
  //     t("settings.deleteAccount.confirmTitle"),
  //     t("settings.deleteAccount.confirmMessage"),
  //     [
  //       {
  //         text: t("common.cancel"),
  //         style: "cancel",
  //       },
  //       {
  //         text: t("common.delete"),
  //         onPress: () => {
  //           // Implement account deletion logic
  //           console.log("Account Deleted");
  //           logout(); // Log out after deletion
  //           router.replace("/login");
  //         },
  //         style: "destructive",
  //       },
  //     ],
  //     { cancelable: false }
  //   );
  // };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scrollViewContent: {
          paddingVertical: SPACING_MEDIUM,
        },
        container: {
          flex: 1,
          paddingHorizontal: SPACING_MEDIUM,
        },
        listSection: {
          marginBottom: SPACING_MEDIUM,
          backgroundColor: theme.colors.surface, // Use theme surface color
          borderRadius: theme.roundness, // Use global roundness from theme
          elevation: 2,
        },
        listItem: {
          paddingStart: SPACING_MEDIUM,
        },
        rightIcon: {
          marginRight: -SPACING_MEDIUM, // Increased negative margin to pull icon further left
        },
        errorText: {
          color: theme.colors.error,
          textAlign: "center",
          marginTop: SPACING_MEDIUM,
        },
      }),
    [theme]
  );

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title={t("settings.title")} />
      </Appbar.Header>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.container}>
          {loadingProfile ? (
            <ActivityIndicator
              animating={true}
              color={theme.colors.primary}
              style={{ marginTop: SPACING_MEDIUM }}
            />
          ) : errorProfile ? (
            <Text style={styles.errorText}>{errorProfile.message}</Text>
          ) : isLoggedIn && fetchedUserProfile ? (
            <List.Section style={styles.listSection}>
              <List.Item
                style={styles.listItem}
                title={
                  fetchedUserProfile.name || t("settings.profile.guestUser")
                }
                description={
                  fetchedUserProfile.email || fetchedUserProfile.phone || "N/A"
                }
                left={() => (
                  <Avatar.Image
                    size={48}
                    source={
                      fetchedUserProfile.avatar
                        ? { uri: fetchedUserProfile.avatar }
                        : FamilyAvatar
                    }
                  />
                )}
                onPress={handleEditProfile}
              />
            </List.Section>
          ) : (
            <List.Section style={styles.listSection}>
              <List.Item
                style={styles.listItem}
                title={t("settings.profile.loginRegister")}
                description={t("settings.profile.loginRegisterDescription")}
                left={() => <List.Icon icon="account-circle-outline" />}
                onPress={() => router.push("/login")}
              />
            </List.Section>
          )}

          {isLoggedIn && ( // Only show Privacy & Security if logged in
            <List.Section
              title={t("settings.privacySecurity.title")}
              style={styles.listSection}
            >
              <List.Item
                style={styles.listItem}
                left={() => <List.Icon icon="download" />}
                title={t("settings.privacySecurity.downloadData")}
                onPress={() => console.log("Download my data")}
              />
              {/* <Divider />
              <List.Item
                style={styles.listItem}
                left={() => <List.Icon icon="delete" />}
                title={t("settings.privacySecurity.deleteAccount")}
                onPress={handleDeleteAccount}
                titleStyle={{ color: theme.colors.error }}
              /> */}
            </List.Section>
          )}

          {/* 4. Tuỳ chỉnh giao diện (App Appearance) */}
          <List.Section
            title={t("settings.appAppearance.title")}
            style={styles.listSection}
          >
            <List.Item
              style={styles.listItem}
              left={() => <List.Icon icon="theme-light-dark" />}
              title={t("settings.appAppearance.theme")}
              right={() => (
                <Switch value={isDarkMode} onValueChange={toggleTheme} />
              )}
            />
          </List.Section>

          {/* 5. Ngôn ngữ (Language) */}
          <List.Section
            title={t("settings.language.title")}
            style={styles.listSection}
          >
            <List.Item
              style={styles.listItem}
              left={() => <List.Icon icon="translate" />}
              title={t("settings.language.vietnamese")}
              onPress={() => changeLanguage("vi")}
              right={() =>
                currentLanguage === "vi" ? (
                  <List.Icon style={styles.rightIcon} icon="check" />
                ) : null
              }
            />
            <Divider />
            <List.Item
              style={styles.listItem}
              left={() => <List.Icon icon="translate" />}
              title={t("settings.language.english")}
              onPress={() => changeLanguage("en")}
              right={() =>
                currentLanguage === "en" ? <List.Icon icon="check" /> : null
              }
            />
          </List.Section>

          {/* 9. Trung tâm hỗ trợ (Help & Support) */}
          <List.Section
            title={t("settings.helpSupport.title")}
            style={styles.listSection}
          >
            <List.Item
              style={styles.listItem}
              left={() => <List.Icon icon="help-circle" />}
              title={t("settings.helpSupport.faq")}
              onPress={() => router.push("/settings/faq-webview")}
              right={() => (
                <List.Icon icon="chevron-right" style={styles.rightIcon} />
              )}
            />
            <Divider />
            <List.Item
              style={styles.listItem}
              left={() => <List.Icon icon="comment-edit" />}
              title={t("settings.helpSupport.feedback")}
              onPress={() => router.push("/settings/feedback-webview")}
              right={() => (
                <List.Icon icon="chevron-right" style={styles.rightIcon} />
              )}
            />
          </List.Section>

          {/* 10. Về ứng dụng (About) */}
          <List.Section
            title={t("settings.aboutApp.title")}
            style={styles.listSection}
          >
            <List.Item
              style={styles.listItem}
              left={() => <List.Icon icon="information" />}
              title={t("settings.aboutApp.versionInfo")}
              right={() => <Text>{`${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`}</Text>} // Get actual version
            />
            <Divider />
            <List.Item
              style={styles.listItem}
              left={() => <List.Icon icon="file-document-multiple" />}
              title={t("settings.aboutApp.legalInfo")}
              onPress={() => router.push("/settings/legal-webview")}
              right={() => (
                <List.Icon icon="chevron-right" style={styles.rightIcon} />
              )}
            />
          </List.Section>

          {isLoggedIn && ( // Only show Logout button if logged in
            <Button
              mode="contained"
              style={{
                borderRadius: theme.roundness,
              }}
              onPress={handleLogout}
            >
              {t("settings.logout.button")}
            </Button>
          )}
        </View>
      </ScrollView>
    </>
  );
}
