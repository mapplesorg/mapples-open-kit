import { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';

import { SizableStyleProps } from '../types';

export type StyledNamedStyles<T> = {
  [P in keyof T]:
    | SizableStyleProps<ViewStyle>
    | SizableStyleProps<TextStyle>
    | SizableStyleProps<ImageStyle>;
};

export type StyledProp<T> = StyleProp<SizableStyleProps<T>>;

export type StyledProps<T extends object> = {
  [P in keyof T]: T[P] extends StyleProp<infer I> ? StyledProp<I> : T[P];
};

export type WithStyledProps<T> = {
  styled?: StyledProps<Partial<T>>;
} & T;
