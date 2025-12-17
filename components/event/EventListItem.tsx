import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, TouchableRipple } from 'react-native-paper'; // Import TouchableRipple
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING_MEDIUM, SPACING_SMALL } from '@/constants/dimensions'; // Removed SPACING_LARGE
import { EventType } from '@/types'; // Import EventType

interface EventListItemProps {
  event: {
    name: string;
    date: string; // YYYY-MM-DD
    lunarText?: string;
    type: EventType; // Changed from string to EventType
    color?: string;
    id: string; // Event ID needed for navigation
  };
  onPress?: (eventId: string) => void; // Add onPress prop
}

const EventListItem: React.FC<EventListItemProps> = ({ event, onPress }) => { // Destructure onPress
  const theme = useTheme();

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
    <TouchableRipple
      onPress={() => onPress && event.id && onPress(event.id)} // Pass event.id
      style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]} // Apply styles to TouchableRipple
    >
      <>
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
      </>
    </TouchableRipple>
  );
};

export default EventListItem;
