import React, { useMemo } from 'react'; // Import useMemo
import { View, StyleSheet } from 'react-native';
import { Surface, Text, useTheme, TouchableRipple } from 'react-native-paper';

interface DayCellProps {
  solarDate: string; // YYYY-MM-DD
  solarDay: number;
  lunarText?: string; // "12/8"
  events?: {
    type: string;
    color?: string;
  }[];
  isToday?: boolean;
  onPress?: (solarDate: string) => void;
}

const DayCell: React.FC<DayCellProps> = ({
  solarDate,
  solarDay,
  lunarText,
  events,
  isToday,
  onPress,
}) => {
  const theme = useTheme();
  const hasEvents = events && events.length > 0;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      minWidth: 50, // Đảm bảo diện tích chạm tối thiểu
      minHeight: 50, // Đảm bảo diện tích chạm tối thiểu
      aspectRatio: 1, // Hình vuông
      borderRadius: theme.roundness,
      padding: 1,
      elevation: 1, // Shadow cho Android
      shadowOffset: { width: 0, height: 1 }, // Shadow cho iOS
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
    ripple: {
      flex: 1, // Đảm bảo ripple lấp đầy Surface
      borderRadius: theme.roundness, // Khớp với border radius của Surface
    },
    content: {
      flex: 1,
      justifyContent: 'center', // Canh giữa theo chiều dọc
      alignItems: 'center',    // Canh giữa theo chiều ngang
      padding: 4,
    },
    solarDay: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    lunarText: {
      position: 'absolute',
      fontSize: 10,
      opacity: 0.7,
      bottom: 2,
      width: "100%",
      textAlign:"center"
    },
    eventIndicatorContainer: {
      position: 'absolute', // Position absolutely within the content
      top: 2, // Small offset from bottom
      right: 2, // Small offset from right
      flexDirection: 'row', // Hiển thị các chấm sự kiện theo chiều ngang
    },
    eventDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginHorizontal: 1, // Khoảng cách giữa các chấm
    },
  }), [theme]); // Depend on theme

  // Lấy màu sắc từ theme hoặc sử dụng màu mặc định
  const surfaceBackgroundColor = isToday
    ? theme.colors.primaryContainer
    : hasEvents
    ? theme.colors.surfaceVariant
    : theme.colors.surface;

  return (
    <Surface
      style={[
        styles.container,
        { backgroundColor: surfaceBackgroundColor },
      ]}
      testID={`day-cell-${solarDate}`}
    >
      <TouchableRipple
        onPress={() => onPress && onPress(solarDate)}
        rippleColor="rgba(0, 0, 0, .1)"
        style={styles.ripple}
      >
        <View style={styles.content}>
          {/* Ngày dương */}
          <Text style={[styles.solarDay, { color: theme.colors.onSurface }]}>
            {solarDay}
          </Text>

          {/* Ngày âm (nếu có) */}
          {lunarText && (
            <Text
              style={[styles.lunarText, { color: theme.colors.onSurfaceVariant }]}
            >
              {lunarText}
            </Text>
          )}

          {/* Chỉ báo sự kiện */}
          {hasEvents && (
            <View style={styles.eventIndicatorContainer}>
              {events.slice(0, 3).map((event, index) => ( // Giới hạn hiển thị 3 chấm
                <View
                  key={index}
                  style={[
                    styles.eventDot,
                    { backgroundColor: event.color || theme.colors.primary }, // Sử dụng màu sự kiện hoặc màu primary
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      </TouchableRipple>
    </Surface>
  );
};

export default DayCell;