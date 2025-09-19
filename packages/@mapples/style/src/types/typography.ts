import { TextStyle } from 'react-native';

export type TypographyMap = Record<string, TextStyle>;

export interface TypographyConfig {
  fontFamily: string;
  color: string;
  default: string;
  typography: TypographyMap;
}
