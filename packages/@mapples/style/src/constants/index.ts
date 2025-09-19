import {
  ThemeConfig,
  TypographyConfig,
  SizingConfig,
  ResponsiveConfig,
} from '../types';

export const DefaultThemeConfig: ThemeConfig = {
  variant: 'auto',
  defaultColor: '#000000',
  light: {},
  dark: {},
  _displayTheme: 'light',
};

export const DefaultTypographyConfig: TypographyConfig = {
  fontFamily: 'System',
  color: '#000000',
  default: 'text',
  typography: {},
};

export const DefaultSizingConfig: SizingConfig = {
  base: 4,
  sizing: {},
};

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
