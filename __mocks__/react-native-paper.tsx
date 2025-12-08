import React from 'react';
import { View, Text as ReactNativeText } from 'react-native';

export const Searchbar = (props: any) => (
  <View {...props}>
    {props.placeholder && <ReactNativeText>{props.placeholder}</ReactNativeText>}
    {props.value && <ReactNativeText>{props.value}</ReactNativeText>}
    {props.children}
  </View>
);
export const Text = (props: any) => <ReactNativeText {...props}>{props.children}</ReactNativeText>;
export const IconButton = (props: any) => <View {...props}>{props.children}</View>;
export const useTheme = () => ({ colors: { primary: 'blue' } }); // Minimal mock for useTheme
