import React from 'react';

// Define the stable theme object once, outside the mock factory
export const stableThemeObject = {
  colors: {
    background: '#ffffff',
    surfaceVariant: '#f0f0f0',
    errorContainer: '#ffcccc',
    onErrorContainer: '#cc0000',
    onBackground: '#333333',
  },
  roundness: 4,
};

// Create a mock function that always returns the stableThemeObject
export const mockUseTheme = jest.fn(() => stableThemeObject);

// Mock react-native-paper comprehensively
const ReactNativePaper = {
  // Mock Provider to simply render its children
  Provider: ({ children }: { children: React.ReactNode }) => children,
  // Mock useTheme to return our stable theme object
  useTheme: mockUseTheme,
  // Mock MD3LightTheme and MD3DarkTheme as they are used by getPaperTheme in constants/theme
  // which might be indirectly pulled in by react-native-paper internals or other components.
  MD3LightTheme: stableThemeObject,
  MD3DarkTheme: { // A minimal dark theme mock
    ...stableThemeObject,
    colors: { ...stableThemeObject.colors, background: '#000000', onBackground: '#FFFFFF' }
  },
  // Add other react-native-paper exports if they are explicitly used by the hook or its dependencies.
  // For example, if Text, Button, Appbar, etc. were imported directly by the hook, they would need mocks here.
};

export default ReactNativePaper;