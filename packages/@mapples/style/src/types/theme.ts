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
 * Project-wide icon settings.
 *
 * `family` names an icon family (an `IconFamilyKey` from `@mapples/ui`,
 * e.g. `'ionicons'`) — typed as `string` here because the style package
 * sits below the ui package and cannot import the union.
 */
export interface IconsConfig {
  /** The icon family every `Icon` element draws its glyphs from */
  family: string;
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
  /** Project-wide icon settings (absent in documents saved before icons existed) */
  icons?: IconsConfig;
  /** Internal property for display theme tracking */
  _displayTheme: 'light' | 'dark';
}
