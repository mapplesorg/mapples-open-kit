import { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';

import { SizableStyleProps } from '../types';

/**
 * Named styles object with enhanced sizing support for all style types.
 * Allows using sizing values (dimensions, multipliers, calc expressions) in style definitions.
 */
export type StyledNamedStyles<T> = {
  [P in keyof T]:
    | SizableStyleProps<ViewStyle>
    | SizableStyleProps<TextStyle>
    | SizableStyleProps<ImageStyle>;
};

/**
 * Enhanced style prop that supports sizing values and theme interpolation.
 * Extends React Native's StyleProp with sizing and theme capabilities.
 */
export type StyledProp<T> = StyleProp<SizableStyleProps<T>>;

/**
 * Props type that transforms all style properties to support enhanced styling.
 * Converts standard style props to styled props with theme and sizing support.
 */
export type StyledProps<T extends object> = {
  [P in keyof T]: T[P] extends StyleProp<infer I> ? StyledProp<I> : T[P];
};

/**
 * Component props type that adds optional styled props support.
 * Allows components to accept styled props for enhanced styling capabilities.
 */
export type WithStyledProps<T> = {
  /** Optional styled props for advanced styling with theme and responsive support */
  styled?: StyledProps<Partial<T>>;
} & T;
