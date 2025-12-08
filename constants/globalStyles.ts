import { StyleSheet } from 'react-native';
import { SPACING_MEDIUM, SPACING_LARGE, SPACING_SMALL } from './dimensions';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING_SMALL,
  },
  safeArea: {
    flex: 1,
  },
  // Text styles
  textCenter: {
    textAlign: 'center',
  },
  textPrimary: {
    // This will depend on the theme, so it's better to use useTheme hook in components
  },
  // Spacing
  marginVerticalMedium: {
    marginVertical: SPACING_MEDIUM,
  },
  marginHorizontalMedium: {
    marginHorizontal: SPACING_MEDIUM,
  },
  paddingMedium: {
    padding: SPACING_MEDIUM,
  },
  paddingLarge: {
    padding: SPACING_LARGE,
  },
  // Flexbox
  flexRow: {
    flexDirection: 'row',
  },
  flexRowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexCentered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Cards and sections
  card: {
    marginBottom: SPACING_MEDIUM,
    elevation: 2, // Shadow for Android
  },
  // You can add more common styles here
});
