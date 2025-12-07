import { cloneDeep, merge } from 'lodash';
import { StyleProp, StyleSheet } from 'react-native';

import {
  DefaultResponsiveConfig,
  DefaultSizingConfig,
  DefaultThemeConfig,
  DefaultTypographyConfig,
} from '../constants';
import {
  DeepPartial,
  SizableStyleProps,
  StyleContextType,
  StyledNamedStyles,
} from '../types';

/**
 * Creates a styled styles object with enhanced sizing support.
 *
 * @param style - The styles object to create
 * @returns The created styles object with enhanced sizing capabilities
 *
 * @example
 * ```tsx
 * const styles = Styler.create({
 *   container: {
 *     padding: 'sizing.md',
 *     backgroundColor: 'theme.colors.background'
 *   }
 * });
 * ```
 */
const create = <T extends StyledNamedStyles<T> | StyledNamedStyles<any>>(
  style: T & StyledNamedStyles<T>,
): T => {
  return style;
};

/**
 * Initializes a complete style configuration by merging custom settings with defaults.
 *
 * @param style - Optional partial style configuration to merge with defaults
 * @returns Complete style configuration with all required properties
 *
 * @example
 * ```tsx
 * const styleConfig = Styler.init({
 *   themeConfig: {
 *     variant: 'dark',
 *     light: { colors: { primary: '#007AFF' } }
 *   }
 * });
 * ```
 */
export const init = (
  style?: DeepPartial<StyleContextType>,
): StyleContextType => {
  return {
    themeConfig: merge(cloneDeep(DefaultThemeConfig), style?.themeConfig),
    typographyConfig: merge(
      cloneDeep(DefaultTypographyConfig),
      style?.typographyConfig,
    ),
    sizingConfig: merge(cloneDeep(DefaultSizingConfig), style?.sizingConfig),
    responsiveConfig: merge(
      cloneDeep(DefaultResponsiveConfig),
      style?.responsiveConfig,
    ),
  };
};

/**
 * Normalizes zIndex to ensure it's always a number.
 *
 * @param value - The zIndex value to normalize
 * @returns Normalized zIndex as a number, or undefined if invalid
 */
const normalizeZIndex = (value: unknown): number | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const numValue = typeof value === 'string' ? Number(value) : value;
  return typeof numValue === 'number' && !isNaN(numValue) ? numValue : undefined;
};

/**
 * Flattens a style prop into a single style object.
 *
 * @param style - The style prop to flatten
 * @returns Flattened style object
 *
 * @example
 * ```tsx
 * const flattenedStyle = Styler.flatten([
 *   { padding: 10 },
 *   { margin: 5 },
 *   { backgroundColor: 'red' }
 * ]);
 * ```
 */
export const flatten = <T extends object>(
  style?: StyleProp<SizableStyleProps<T>>,
) => {
  const flattened = StyleSheet.flatten(style);
  if (
    flattened &&
    typeof flattened === 'object' &&
    !Array.isArray(flattened) &&
    'zIndex' in flattened
  ) {
    const normalizedZIndex = normalizeZIndex(flattened.zIndex);
    if (normalizedZIndex !== undefined) {
      return { ...flattened, zIndex: normalizedZIndex };
    }
    // Remove zIndex if it's invalid (undefined/null/NaN)
    const { zIndex, ...rest } = flattened;
    return rest;
  }
  return flattened;
};

/**
 * Styler utility object providing style creation and management functions.
 */
const Styler = {
  create,
  init,
  flatten,
};

export default Styler;
