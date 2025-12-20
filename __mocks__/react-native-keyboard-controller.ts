// __mocks__/react-native-keyboard-controller.ts

// A minimal mock for react-native-keyboard-controller
// to prevent issues in Jest environment.
export const KeyboardController = {
    // Mock any specific methods or properties that are causing issues
    // For now, an empty object might suffice if the library is mostly about listeners
    // and doesn't directly expose components that need deep mocking.
};

export const KeyboardProvider = ({ children }: any) => children;
export const useKeyboardHandler = () => ({});
export const useResizeMode = () => ({});
export const useGenericKeyboardHandler = () => ({});
export const useNativeEvents = () => ({});
export const useKeyboardAnimation = () => ({});
