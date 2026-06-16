import { ResponsiveConfig } from './responsive';
import { SizingConfig } from './sizing';
import { ThemeConfig } from './theme';
import { TypographyConfig } from './typography';

/**
 * Dimensions of a canvas element used to resolve percentage-based width and height
 * values in styled props instead of falling back to device screen dimensions.
 */
export interface CanvasDimensions {
  /** Canvas width in pixels */
  width: number;
  /** Canvas height in pixels */
  height: number;
}

/**
 * Complete style context configuration containing all style system settings.
 * This is the main configuration object passed to the StyleProvider.
 */
export interface StyleContextType {
  /** Theme configuration for light/dark modes and color definitions */
  themeConfig: ThemeConfig;
  /** Typography configuration for text styling and font definitions */
  typographyConfig: TypographyConfig;
  /** Sizing configuration for spacing and dimension values */
  sizingConfig: SizingConfig;
  /** Responsive configuration for breakpoint management */
  responsiveConfig: ResponsiveConfig;
  /** Optional canvas dimensions for resolving percentage-based width/height in styled props */
  _canvas?: CanvasDimensions;
}

/**
 * Responsive context type that extends responsive configuration with runtime state.
 * Contains current breakpoint information and window dimensions.
 */
export interface ResponsiveContextType extends ResponsiveConfig {
  /** Current window width in pixels */
  windowWidth: number;
  /** Currently active breakpoint name */
  currentBreakpoint: string;
  /** Function to manually set the current breakpoint */
  setBreakpoint: (breakpoint: string) => void;
}
