import React, { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Chip, Text, useTheme } from 'react-native-paper'; // Added Chip
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

// Removed DefaultFamilyAvatar from '@/assets/images/familyAvatar.png';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { FamilyLocationDto } from '@/types';
import { LocationAccuracy, LocationSource, LocationType } from '@/types/familyLocation.d'; // Import enums

interface FamilyLocationItemProps {
  item: FamilyLocationDto;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPress?: (id: string) => void; // Made optional to align with MemberItem
}

const getStyles = (theme: any) => StyleSheet.create({
  card: {
    marginBottom: SPACING_MEDIUM,
    marginHorizontal: 1,
    width: "100%",
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    marginRight: SPACING_MEDIUM,
    backgroundColor: theme.colors.surfaceVariant, // Add a background color for the avatar
  },
  cardText: {
    flex: 1,
  },
  familyLocationDetailsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // marginLeft: -SPACING_SMALL, // Adjust spacing if needed
    marginTop: SPACING_SMALL / 2,
  },
  detailChip: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    borderWidth: 0,
    marginRight: SPACING_SMALL, // Spacing between chips
  },
});

const getLocationTypeIcon = (locationType: LocationType) => {
  switch (locationType) {
    case LocationType.Home:
      return 'home-map-marker';
    case LocationType.Birthplace:
      return 'baby-carriage';
    case LocationType.Deathplace:
      return 'grave-stone';
    case LocationType.Burial:
      return 'cemetery';
    case LocationType.Other:
    default:
      return 'map-marker-question';
  }
};

const getLocationAccuracyIcon = (accuracy: LocationAccuracy) => {
  switch (accuracy) {
    case LocationAccuracy.Exact:
      return 'target';
    case LocationAccuracy.Approximate:
      return 'magnify-plus-outline';
    case LocationAccuracy.Estimated:
      return 'ruler';
    default:
      return 'help-circle';
  }
};

const getLocationSourceIcon = (source: LocationSource) => {
  switch (source) {
    case LocationSource.UserSelected:
      return 'account-edit';
    case LocationSource.Geocoded:
      return 'map-search';
    default:
      return 'database';
  }
};


const getLocationTypeColor = (locationType: LocationType) => {
  switch (locationType) {
    case LocationType.Home:
      return '#2196F3'; // Blue - Homeland
    case LocationType.Birthplace:
      return '#FFC107'; // Amber - Birthplace
    case LocationType.Deathplace:
      return '#4CAF50'; // Green - Grave
    case LocationType.Burial:
      return '#9C27B0'; // Purple - Cemetery
    case LocationType.Other:
    default:
      return '#607D8B'; // Blue Gray - Other
  }
};


const getLocationTypeString = (locationType: LocationType) => {
  switch (locationType) {
    case LocationType.Home: return 'home';
    case LocationType.Birthplace: return 'birthplace';
    case LocationType.Deathplace: return 'deathplace';
    case LocationType.Burial: return 'burial';
    case LocationType.Other: return 'other';
    default: return 'unknown'; // Fallback for unexpected values
  }
};

const getLocationAccuracyString = (accuracy: LocationAccuracy) => {
  switch (accuracy) {
    case LocationAccuracy.Exact: return 'exact';
    case LocationAccuracy.Approximate: return 'approximate';
    case LocationAccuracy.Estimated: return 'estimated';
    default: return 'unknown'; // Fallback for unexpected values
  }
};

const getLocationSourceString = (source: LocationSource) => {
  switch (source) {
    case LocationSource.UserSelected: return 'userSelected'; // Corrected to userSelected
    case LocationSource.Geocoded: return 'geocoded';
    default: return 'unknown'; // Fallback for unexpected values
  }
};

const FamilyLocationItem = ({ item, onEdit, onDelete, onPress }: FamilyLocationItemProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const styles = getStyles(theme);

  const handleCardPress = useCallback(() => {
    if (onPress) {
      onPress(item.id);
    } else {
      // Default navigation if onPress is not provided, similar to MemberItem
      router.push(`/family-location/${item.id}`);
    }
  }, [onPress, item.id, router]);

  return (
    <Card style={[styles.card, { borderRadius: theme.roundness }]} onPress={handleCardPress}>
      <Card.Content style={styles.cardContent}>
        <Avatar.Icon size={48} icon="map-marker" style={styles.avatar} color={getLocationTypeColor(item.locationType)} />
        <View style={styles.cardText}>
          <Text variant="titleMedium">{item.name}</Text>
          {(item.address || item.description) && (
            <Text variant="bodySmall" style={{ marginTop: SPACING_SMALL / 4 }}>
              {item.address || item.description || t('common.noDescription')}
            </Text>
          )}
          <View style={styles.familyLocationDetailsChips}>
            {item.locationType !== undefined && (
              <Chip icon={getLocationTypeIcon(item.locationType)} style={styles.detailChip} compact={true}>
                {t(`locationType.${getLocationTypeString(item.locationType)}`)}
              </Chip>
            )}
            {item.accuracy !== undefined && (
              <Chip icon={getLocationAccuracyIcon(item.accuracy)} style={styles.detailChip} compact={true}>
                {t(`locationAccuracy.${getLocationAccuracyString(item.accuracy)}`)}
              </Chip>
            )}
            {item.source !== undefined && (
              <Chip icon={getLocationSourceIcon(item.source)} style={styles.detailChip} compact={true}>
                {t(`locationSource.${getLocationSourceString(item.source)}`)}
              </Chip>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

export default memo(FamilyLocationItem);
