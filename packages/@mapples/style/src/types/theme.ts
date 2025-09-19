export type RGB = `rgb(${number}, ${number}, ${number})`;
export type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
export type HEX = `#${string}`;

export type Color = RGB | RGBA | HEX;

export interface ThemeMap {
  [i: string]: Color | ThemeMap;
}

export interface ThemeConfig {
  variant: 'light' | 'dark' | 'auto';
  defaultColor: Color;
  light: ThemeMap;
  dark: ThemeMap;
  _displayTheme: 'light' | 'dark';
}
