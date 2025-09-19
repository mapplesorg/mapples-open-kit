import { TextStyle } from 'react-native';

/** Map of typography variant names to their corresponding text styles */
export type TypographyMap = Record<string, TextStyle>;

/**
 * Typography configuration for consistent text styling across the application.
 * Defines font family, default color, and typography variants.
 */
export interface TypographyConfig {
  /** Default font family to use for all typography variants */
  fontFamily: string;
  /** Default text color for typography variants */
  color: string;
  /** Default typography variant to use when no variant is specified */
  default: string;
  /** Map of typography variants with their corresponding styles */
  typography: TypographyMap;
}
