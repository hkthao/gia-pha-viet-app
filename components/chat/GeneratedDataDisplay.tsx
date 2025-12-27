import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme, List, Text, IconButton, Divider } from "react-native-paper";
import {
  CombinedAiContentDto,
  MemberListDto,
  EventDto,
  FamilyLocationDto,
} from "@/types"; // Import CombinedAiContentDto and specific DTOs
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SPACING_MEDIUM } from "@/constants/dimensions";

interface GeneratedDataDisplayProps {
  generatedData: CombinedAiContentDto;
}

const GeneratedDataDisplay: React.FC<GeneratedDataDisplayProps> = ({
  generatedData,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: {
      width: "100%",
    },
    listItem: {
      backgroundColor: "transparent",
      borderRadius: theme.roundness,
      marginRight: -SPACING_MEDIUM,
    },
    divider:{
      backgroundColor: theme.colors.onBackground
    }
  });

  const handleAddAction = (type: string, data: any) => {
    let params: any = {};
    switch (type) {
      case "member":
        if (data) {
          params = {
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth,
            dateOfDeath: data.dateOfDeath,
            gender: data.gender,
            // Add other relevant member fields
          };
        }
        router.push({ pathname: "/member/create", params: params });
        break;
      case "event":
        if (data) {
          params = {
            name: data.name,
            description: data.description,
            solarDate: data.solarDate,
            location: data.location,
            type: data.type,
            // Add other relevant event fields
          };
        }
        router.push({ pathname: "/event/create", params: params });
        break;
      case "location":
        if (data) {
          params = {
            name: data.name,
            description: data.description,
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address,
            locationType: data.locationType,
            // Add other relevant location fields
          };
        }
        router.push({ pathname: "/family-location/create", params: params });
        break;
      default:
        console.warn("Unhandled add action type:", type);
    }
  };

  const renderMemberItem = (member: MemberListDto, index: number) => (
    <List.Item
      key={member.id || `member-${index}`}
      title={`${member.firstName} ${member.lastName}` || t("common.unknown")}
      description={
        (() => {
          let desc = "";
          if (member.dateOfBirth) {
            desc += `${t("memberDetail.dateOfBirth")}: ${new Date(
              member.dateOfBirth
            ).toLocaleDateString()}`;
          }
          if (member.dateOfDeath) {
            desc +=
              (desc ? " | " : "") +
              `${t("memberDetail.dateOfDeath")}: ${new Date(
                member.dateOfDeath
              ).toLocaleDateString()}`;
          }
          if (member.gender) {
            desc +=
              (desc ? " | " : "") +
              `${t("member.gender")}: ${t(`common.${member.gender.toLowerCase()}`)}`;
          }
          return desc || t("common.noDescription");
        })()
      }
      left={(props) => <List.Icon {...props} icon="account" />}
      right={() => (
        <IconButton
          icon="plus"
          size={24}
          onPress={() => handleAddAction("member", member)} // Pass member object
          accessibilityLabel={t("common.add")}
        />
      )}
      style={styles.listItem}
    />
  );

  const renderEventItem = (event: EventDto, index: number) => (
    <List.Item
      key={event.id || `event-${index}`}
      title={event.name || t("common.noTitle")}
      description={event.description || t("common.noDescription")}
      left={(props) => <List.Icon {...props} icon="calendar-month" />}
      right={() => (
        <IconButton
          icon="plus"
          size={24}
          onPress={() => handleAddAction("event", event)} // Pass event object
          accessibilityLabel={t("common.add")}
        />
      )}
      style={styles.listItem}
    />
  );

  const renderLocationItem = (location: FamilyLocationDto, index: number) => (
    <List.Item
      key={location.id || `location-${index}`}
      title={location.name || t("common.noTitle")}
      description={location.address || t("common.noDescription")}
      left={(props) => <List.Icon {...props} icon="map-marker" />}
      right={() => (
        <IconButton
          icon="plus"
          size={24}
          onPress={() => handleAddAction("location", location)} // Pass location object
          accessibilityLabel={t("common.add")}
        />
      )}
      style={styles.listItem}
    />
  );

  return (
    <View style={styles.container}>
      {generatedData.members && generatedData.members.length > 0 && (
        <>
          {generatedData.members.map((member, index) => (
            <React.Fragment key={member.id || `member-${index}`}>
              {renderMemberItem(member, index)}
              {index < generatedData.members!.length - 1 && <Divider style={styles.divider} />}
            </React.Fragment>
          ))}
        </>
      )}

      {generatedData.events && generatedData.events.length > 0 && (
        <>
          {generatedData.events.map((event, index) => (
            <React.Fragment key={event.id || `event-${index}`}>
              {renderEventItem(event, index)}
              {index < generatedData.events!.length - 1 && <Divider style={styles.divider}/>}
            </React.Fragment>
          ))}
        </>
      )}

      {generatedData.locations && generatedData.locations.length > 0 && (
        <>
          {generatedData.locations.map((location, index) => (
            <React.Fragment key={location.id || `location-${index}`}>
              {renderLocationItem(location, index)}
              {index < generatedData.locations!.length - 1 && <Divider style={styles.divider}/>}
            </React.Fragment>
          ))}
        </>
      )}
      {!generatedData.members?.length &&
        !generatedData.events?.length &&
        !generatedData.locations?.length && (
          <Text
            style={{
              textAlign: "center",
              color: theme.colors.onSurfaceVariant,
            }}
          >
            {t("chat.noGeneratedData")}
          </Text>
        )}
    </View>
  );
};

export default GeneratedDataDisplay;
