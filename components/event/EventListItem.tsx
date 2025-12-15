import React, { useMemo } from 'react'; // Add useMemo
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING_MEDIUM, SPACING_SMALL, SPACING_LARGE } from '@/constants/dimensions'; // Import necessary constants

interface EventListItemProps {
  event: {
    name: string;
    date: string; // YYYY-MM-DD
    lunarText?: string;
    type: string;
    color?: string;
  };
}

const EventListItem: React.FC<EventListItemProps> = ({ event }) => {
  const theme = useTheme(); // Move theme hook inside component

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING_MEDIUM,
      marginHorizontal: SPACING_MEDIUM, // Was 16
      marginVertical: SPACING_SMALL,  // Was 4
      borderRadius: theme.roundness,
    },
    eventIndicator: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: SPACING_MEDIUM + 2, // Was 12
    },
    detailsContainer: {
      flex: 1,
      marginRight: SPACING_MEDIUM - 2, // Was 8
    },
    eventName: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    eventDate: {
      fontSize: 12,
      opacity: 0.8,
    },
  }), [theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={[styles.eventIndicator, { backgroundColor: event.color || theme.colors.primary }]} />
      <View style={styles.detailsContainer}>
        <Text style={[styles.eventName, { color: theme.colors.onSurface }]}>
          {event.name}
        </Text>
        <Text style={[styles.eventDate, { color: theme.colors.onSurfaceVariant }]}>
          {event.date} {event.lunarText ? `(${event.lunarText} âm lịch)` : ''}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={theme.colors.onSurfaceVariant}
      />
    </View>
  );
};

export default EventListItem;