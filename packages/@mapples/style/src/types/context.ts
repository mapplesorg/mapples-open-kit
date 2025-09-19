import { ResponsiveConfig } from './responsive';
import { SizingConfig } from './sizing';
import { ThemeConfig } from './theme';
import { TypographyConfig } from './typography';

export interface StyleContextType {
  themeConfig: ThemeConfig;
  typographyConfig: TypographyConfig;
  sizingConfig: SizingConfig;
  responsiveConfig: ResponsiveConfig;
}

export interface ResponsiveContextType extends ResponsiveConfig {
  windowWidth: number;
  currentBreakpoint: string;
  setBreakpoint: (breakpoint: string) => void;
}
