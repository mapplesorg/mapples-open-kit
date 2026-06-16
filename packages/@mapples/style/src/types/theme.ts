/** RGB color format: `rgb(red, green, blue)` */
export type RGB = `rgb(${number}, ${number}, ${number})`;

/** RGBA color format: `rgba(red, green, blue, alpha)` */
export type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;

/** HEX color format: `#rrggbb` or `#rgb` */
export type HEX = `#${string}`;

/** Supported color formats */
export type Color = RGB | RGBA | HEX;

/**
 * Theme map structure that allows nested color definitions.
 * Can contain color values or nested theme maps for organization.
 */
export interface ThemeMap {
  [i: string]: Color | ThemeMap;
}

/**
 * Complete theme configuration for light and dark modes.
 * Supports automatic theme switching based on device preferences.
 */
export interface ThemeConfig {
  /** Theme variant: 'light', 'dark', or 'auto' for automatic switching */
  variant: 'light' | 'dark' | 'auto';
  /** Default color to use when a color path is not found */
  defaultColor: Color;
  /** Light theme color definitions */
  light: ThemeMap;
  /** Dark theme color definitions */
  dark: ThemeMap;
  /** Internal property for display theme tracking */
  _displayTheme: 'light' | 'dark';
}
