import {
  ThemeConfig,
  TypographyConfig,
  SizingConfig,
  ResponsiveConfig,
} from '../types';

/**
 * Default theme configuration with automatic variant switching.
 * Provides empty light and dark theme objects that can be extended.
 */
export const DefaultThemeConfig: ThemeConfig = {
  variant: 'auto',
  defaultColor: '#000000',
  light: {},
  dark: {},
  _displayTheme: 'light',
};

/**
 * Default typography configuration with system font family.
 * Provides basic typography setup that can be extended with custom variants.
 */
export const DefaultTypographyConfig: TypographyConfig = {
  fontFamily: 'System',
  color: '#000000',
  default: 'text',
  typography: {},
};

/**
 * Default sizing configuration with base size of 4.
 * Provides a base sizing system that can be extended with custom size values.
 */
export const DefaultSizingConfig: SizingConfig = {
  base: 4,
  sizing: {},
};

/**
 * Default responsive configuration with mobile, tablet, and desktop breakpoints.
 * Provides standard breakpoint ranges for responsive design.
 */
export const DefaultResponsiveConfig: ResponsiveConfig = {
  default: 'mobile',
  breakpoints: {
    mobile: {
      min: 0,
      max: 767,
    },
    tablet: {
      min: 768,
      max: 1023,
    },
    desktop: {
      min: 1024,
      max: Infinity,
    },
  },
};
