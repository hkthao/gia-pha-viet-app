import React, { useMemo } from 'react'; // Add useMemo
import { StyleSheet, View, ScrollView } from 'react-native';
import { Portal, Modal, Text, Button, Divider, useTheme } from 'react-native-paper';

interface EventBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  solarDate: string; // YYYY-MM-DD
  lunarText?: string; // "12/8"
  events?: {
    type: string;
    color?: string;
    name: string; // Tên sự kiện
  }[];
  onAddEvent?: (date: string) => void;
}

const EventBottomSheet: React.FC<EventBottomSheetProps> = ({
  visible,
  onDismiss,
  solarDate,
  lunarText,
  events,
  onAddEvent,
}) => {
  const theme = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    modalContainer: {
      margin: 20,
      borderRadius: theme.roundness, // Use theme.roundness
      padding: 20,
      maxHeight: '80%',
    },
    header: {
      marginBottom: 15,
      alignItems: 'center',
    },
    solarDateText: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    lunarText: {
      fontSize: 14,
      opacity: 0.7,
      marginTop: 5,
    },
    divider: {
      width: '100%',
      marginVertical: 10,
    },
    eventList: {
      flexGrow: 1,
      marginBottom: 15,
    },
    eventItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    eventIndicator: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 10,
    },
    addButton: {
      marginTop: 10,
    },
    addButtonLabel: {
      fontSize: 16,
    },
  }), [theme]); // Depend on theme

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.header}>
          <Text style={[styles.solarDateText, { color: theme.colors.onSurface }]}>
            {solarDate}
          </Text>
          {lunarText && (
            <Text style={[styles.lunarText, { color: theme.colors.onSurfaceVariant }]}>
              ({lunarText} âm lịch)
            </Text>
          )}
          <Divider style={styles.divider} />
        </View>

        <ScrollView style={styles.eventList}>
          {events && events.length > 0 ? (
            events.map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <View style={[styles.eventIndicator, { backgroundColor: event.color || theme.colors.primary }]} />
                <Text style={{ color: theme.colors.onSurface }}>{event.name}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Không có sự kiện nào trong ngày này.</Text>
          )}
        </ScrollView>

        <Button
          mode="contained"
          onPress={() => onAddEvent && onAddEvent(solarDate)}
          style={styles.addButton}
          labelStyle={styles.addButtonLabel}
        >
          + Thêm sự kiện
        </Button>
      </Modal>
    </Portal>
  );
};

export default EventBottomSheet;