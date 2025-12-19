import React, { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Chip, Text, useTheme, IconButton } from 'react-native-paper'; // Added IconButton
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import DefaultFamilyAvatar from '@/assets/images/familyAvatar.png';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions';
import { MemberListDto } from '@/types';

interface MemberItemProps {
  item: MemberListDto;
  onPress?: () => void; // Added optional onPress prop
  isSelected?: boolean; // New prop for selection state
}

const getStyles = (theme: any) => StyleSheet.create({
  memberCard: {
    marginBottom: SPACING_MEDIUM,
    marginHorizontal: 1,
    width: "100%",
    position: 'relative', // For absolute positioning of checkmark
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    marginRight: SPACING_MEDIUM,
  },
  cardText: {
    flex: 1,
  },
  memberDetailsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: -SPACING_MEDIUM,
  },
  detailChip: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    borderWidth: 0,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 128, 0, 0.2)', // Greenish overlay for selected
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.roundness,
  },
  checkmark: {
    position: 'absolute',
    top: SPACING_SMALL,
    right: SPACING_SMALL,
  },
});

// ...
const MemberItem = ({ item, onPress, isSelected }: MemberItemProps) => { // Destructure onPress and isSelected
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const styles = getStyles(theme);

  const handleCardPress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/member/${item.id}`);
    }
  }, [onPress, item.id, router]);

  return (
    <Card style={[styles.memberCard, { borderRadius: theme.roundness }]} onPress={handleCardPress}>
      <Card.Content style={styles.cardContent}>
        <Avatar.Image size={48} source={item.avatarUrl ? { uri: item.avatarUrl } : DefaultFamilyAvatar} style={styles.avatar} />
        <View style={styles.cardText}>
          <Text variant="titleMedium">{item.fullName}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING_SMALL / 2 }}>
            {item.occupation && <Text variant="bodySmall">{item.occupation}</Text>}
            {item.occupation && item.birthDeathYears && <Text variant="bodySmall">|</Text>}
            {item.birthDeathYears && <Text variant="bodySmall">{item.birthDeathYears}</Text>}
          </View>
          <View style={styles.memberDetailsChips}>
            {item.gender && (
              <Chip icon="gender-male-female" style={styles.detailChip} compact={true}>
                {t(`memberSearch.filter.gender.${item.gender.toLowerCase()}`)}
              </Chip>
            )}
            {item.fatherFullName && (
              <Chip icon="human-male-boy" style={styles.detailChip} compact={true} >
                {item.fatherFullName}
              </Chip>
            )}
            {item.motherFullName && (
              <Chip icon="human-female-girl" style={styles.detailChip} compact={true} >
                {item.motherFullName}
              </Chip>
            )}
            {item.wifeFullName && (
              <Chip icon="heart" style={styles.detailChip} compact={true} >
                {item.wifeFullName}
              </Chip>
            )}
            {item.husbandFullName && (
              <Chip icon="heart" style={styles.detailChip} compact={true} >
                {item.husbandFullName}
              </Chip>
            )}
          </View>
        </View>
      </Card.Content>
      {isSelected && (
        <View style={styles.selectedOverlay}>
          <IconButton
            icon="check-circle"
            iconColor={theme.colors.primary}
            size={30}
            style={styles.checkmark}
          />
        </View>
      )}
    </Card>
  );
};

export default memo(MemberItem);