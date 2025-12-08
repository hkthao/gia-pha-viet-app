import { renderHook, act } from '@testing-library/react-hooks';
import { usePaginatedSearchListUI, type UsePaginatedSearchListUIProps } from '@/hooks/usePaginatedSearchListUI';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import * as CommonComponents from '@/components/common';
import React from 'react';
import { View } from 'react-native';
import * as Paper from 'react-native-paper';

const stableThemeObject = {
  colors: {
      background: '#fff',
      primary: '#6200ee',
      surface: '#fff',
      errorContainer: '#fcdcdc',
      onErrorContainer: '#000',
      onBackground: '#000',
      onSurfaceVariant: '#333',
  },
  roundness: 8,
};

jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  return {
    ...actual,
    useTheme: jest.fn(() => stableThemeObject),
  };
});
// Mock react-i18next's useTranslation
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => key, // Simple mock: returns the key itself
  })),
}));

// Mock Common Components
jest.mock('@/components/common', () => ({
  DefaultEmptyList: jest.fn(() => null),
  LoadingSpinner: jest.fn(() => null),
  ListFooter: jest.fn(() => null),
}));

// Mock StyleSheet and View from react-native more specifically
jest.mock('react-native', () => ({
  View: 'View', // Mock View as a simple string or component
  StyleSheet: {
    create: (styles: any) => styles, // Our existing StyleSheet mock
  },
}));


describe('usePaginatedSearchListUI', () => {
  beforeEach(() => {
    // Clear mock calls and set initial mock values before each test
    (Paper.useTheme as jest.Mock).mockClear();
    (Paper.useTheme as jest.Mock).mockReturnValue(stableThemeObject);
    (useTranslation as jest.Mock).mockClear();
    (CommonComponents.DefaultEmptyList as jest.Mock).mockClear();
    (CommonComponents.LoadingSpinner as jest.Mock).mockClear();
    (CommonComponents.ListFooter as jest.Mock).mockClear();
  });

  // Test Case 1: Initial Render and structure
  it('should return initial state and functions', () => {
    const { result } = renderHook(() =>
      usePaginatedSearchListUI({
        loading: false,
        refreshing: false,
        itemsLength: 0,
        hasMore: false,
        searchPlaceholder: 'Search items',
      })
    );

    expect(result.current.showFilterUI).toBe(false);
    expect(typeof result.current.toggleFilterVisibility).toBe('function');
    expect(result.current.styles).toBeDefined();
    expect(result.current.EmptyComponent).toBeDefined();
    expect(result.current.FooterComponent).toBeDefined();
    expect(result.current.searchPlaceholder).toBe('Search items');
    expect(result.current.theme).toBeDefined();

    // Verify mockUseTheme and useTranslation are called
    expect(Paper.useTheme).toHaveBeenCalledTimes(1);
    expect(useTranslation).toHaveBeenCalledTimes(1);
  });

  // Test Case 2: toggleFilterVisibility toggles showFilterUI
  it('should toggle showFilterUI when toggleFilterVisibility is called', () => {
    const { result } = renderHook(() =>
      usePaginatedSearchListUI({
        loading: false,
        refreshing: false,
        itemsLength: 0,
        hasMore: false,
      })
    );

    expect(result.current.showFilterUI).toBe(false);

    act(() => {
      result.current.toggleFilterVisibility();
    });

    expect(result.current.showFilterUI).toBe(true);

    act(() => {
      result.current.toggleFilterVisibility();
    });

    expect(result.current.showFilterUI).toBe(false);
  });

  // Test Case 3: styles object is memoized and stable
  it('styles object should be memoized and stable across renders with same theme', () => {
    const initialProps: UsePaginatedSearchListUIProps = { // Explicitly type initialProps
      loading: false,
      refreshing: false,
      itemsLength: 0,
      hasMore: false,
      ListEmptyComponent: undefined, // Include all optional props
    };
    const { result, rerender } = renderHook((props) =>
      usePaginatedSearchListUI(props),
      {
        initialProps,
      }
    );

    const initialStyles = result.current.styles;

    rerender({ ...initialProps, loading: true }); // Pass a new object with updated props
    expect(result.current.styles).toBe(initialStyles);

    rerender({ ...initialProps, refreshing: true }); // Pass a new object with updated props
    expect(result.current.styles).toBe(initialStyles);

    // Simulate theme change
    (Paper.useTheme as jest.Mock).mockImplementationOnce(() => ({
        colors: {
            background: '#000000',
            primary: '#0000ff',
            surface: '#eeeeee',
            errorContainer: '#ffaaaa',
            onErrorContainer: '#ffffff',
            onBackground: '#ffffff',
            onSurfaceVariant: '#cccccc',
        },
        roundness: 4,
    }));
    rerender(initialProps); // Rerender with initialProps to trigger re-evaluation due to theme change
    expect(result.current.styles).not.toBe(initialStyles);
  });

  it('EmptyComponent should be memoized and render conditionally', () => {
    const initialProps: UsePaginatedSearchListUIProps = {
      loading: false,
      refreshing: false,
      itemsLength: 0,
      hasMore: false,
      searchPlaceholder: 'Search items',
      ListEmptyComponent: undefined,
    };
    const { result, rerender } = renderHook((props) =>
      usePaginatedSearchListUI(props),
      {
        initialProps,
      }
    );

    // Initial render: DefaultEmptyList
    expect(result.current.EmptyComponent.type).toBe(CommonComponents.DefaultEmptyList);
    expect(result.current.EmptyComponent.props).toEqual(expect.objectContaining({
      styles: result.current.styles,
      t: expect.any(Function),
    }));

    // Rerender with no dependency changes: DefaultEmptyList
    rerender(initialProps);
    expect(result.current.EmptyComponent.type).toBe(CommonComponents.DefaultEmptyList);

    // Rerender with loading: true: should switch to LoadingSpinner
    rerender({ ...initialProps, loading: true });
    expect(result.current.EmptyComponent.type).toBe(CommonComponents.LoadingSpinner);
    expect(result.current.EmptyComponent.props).toEqual(expect.objectContaining({
      styles: result.current.styles,
      theme: result.current.theme,
    }));

    // Rerender with loading: true again: LoadingSpinner
    rerender({ ...initialProps, loading: true });
    expect(result.current.EmptyComponent.type).toBe(CommonComponents.LoadingSpinner);

    // Rerender with refreshing: true (implicitly loading: false, so it takes precedence): should switch to LoadingSpinner
    rerender({ ...initialProps, refreshing: true });
    expect(result.current.EmptyComponent.type).toBe(CommonComponents.LoadingSpinner);
    expect(result.current.EmptyComponent.props).toEqual(expect.objectContaining({
      styles: result.current.styles,
      theme: result.current.theme,
    }));

    // Rerender with refreshing: true again: LoadingSpinner
    rerender({ ...initialProps, refreshing: true });
    expect(result.current.EmptyComponent.type).toBe(CommonComponents.LoadingSpinner);


    // Custom ListEmptyComponent (as element)
    const CustomEmptyElement = <View testID="custom-empty-element" />;
    rerender({ ...initialProps, ListEmptyComponent: CustomEmptyElement });
    expect(result.current.EmptyComponent).toBe(CustomEmptyElement); // Exact element reference should be preserved

    // Custom ListEmptyComponent (as component type)
    const CustomEmptyComponent = () => <View testID="custom-empty-component" />;
    rerender({ ...initialProps, ListEmptyComponent: CustomEmptyComponent });
    expect(result.current.EmptyComponent.type).toBe(CustomEmptyComponent);
  });
});