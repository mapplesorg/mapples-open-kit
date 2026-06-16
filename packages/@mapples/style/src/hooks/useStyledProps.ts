import { useMemo } from 'react';

import { replace } from 'lodash';

import {
  applyResponsiveStylesRecursively,
  getThemeRegexp,
  isCalc,
  isMultiply,
  processExoticKeys,
} from '../utils';

import useResponsive from './useResponsive';
import useSizing from './useSizing';
import useStyle from './useStyle';
import useTheme from './useTheme';

/**
 * Hook that processes styled props with theme references, sizing calculations, responsive styles,
 * and exotic key conversions. Handles deeply nested structures including arrays of style objects.
 *
 * Processing steps:
 * 1. Replaces theme and sizing references (e.g., 'theme.colors.primary', 'sizing.md', '*2')
 * 2. Applies responsive styles recursively to all nested objects
 * 3. Converts exotic keys (boxShadow objects, zIndex strings) to proper formats
 *
 * @template T - The type of the props object
 * @param props - Optional props object containing styled properties with theme/sizing references
 * @returns Processed props object with all references resolved and styles applied
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const styledProps = useStyledProps({
 *     styled: [
 *       [
 *         { width: 24, height: 24, color: "#F8F9FA" },
 *         {}
 *       ],
 *       { width: 24, height: 24 }
 *     ],
 *     color: 'theme.palette.primary',
 *     padding: 'sizing.md',
 *     fontSize: '*2',
 *     boxShadow: { x: 2, y: 4, radius: 8, color: 'theme.colors.shadow' }
 *   });
 *
 *   return <View style={styledProps.styled[0][0]} />;
 * };
 * ```
 *
 * @example
 * ```tsx
 * // With responsive styles
 * const styledProps = useStyledProps({
 *   styled: {
 *     fontSize: 16,
 *     '&:tablet': { fontSize: 20 },
 *     '&:desktop': { fontSize: 24 },
 *     nested: {
 *       padding: 8,
 *       '&:tablet': { padding: 16 }
 *     }
 *   }
 * });
 * ```
 *
 * @example
 * ```tsx
 * // Complex nested structure
 * const styledProps = useStyledProps({
 *   styled: [
 *     [
 *       {
 *         width: 'sizing.lg',
 *         height: 'sizing.lg',
 *         backgroundColor: 'theme.colors.background',
 *         '&:mobile': { width: 'sizing.sm' }
 *       },
 *       { margin: '*2' }
 *     ]
 *   ],
 *   zIndex: '10'
 * });
 * ```
 */
const useStyledProps = <T extends object>(props?: T) => {
  const { theme, getColor } = useTheme();
  const { sizing, getSize } = useSizing();
  const { getResponsiveStyle } = useResponsive();
  const { _canvas } = useStyle();

  const pattern = useMemo(
    () => getThemeRegexp({ theme, sizing }),
    [theme, sizing],
  );

  // Step 1: Replace theme and sizing references throughout the entire structure
  const formated = useMemo(() => {
    if (!props) {
      return {};
    }

    const stringifyProps = JSON.stringify(props);

    const replaced = replace(stringifyProps, pattern, (value) => {
      const normalizedValue = replace(value, /"/gi, '');

      if (normalizedValue?.startsWith('theme'))
        return getColor(normalizedValue) || value;

      if (
        normalizedValue?.startsWith('sizing') ||
        isMultiply(normalizedValue) ||
        isCalc(normalizedValue)
      )
        return getSize(normalizedValue)?.toString() || value;

      return value;
    });

    return (JSON.parse(replaced) ?? {}) as T | T[];
  }, [getColor, getSize, pattern, props]);

  // Step 2: Recursively apply responsive styles and process exotic keys
  return useMemo(() => {
    if (!formated) {
      return {};
    }

    // Recursively apply responsive styles to all nested structures
    const withResponsive = applyResponsiveStylesRecursively(
      formated,
      getResponsiveStyle,
    );

    // Recursively process exotic keys (like boxShadow) throughout the structure
    return processExoticKeys(withResponsive, getColor, _canvas);
  }, [_canvas, formated, getColor, getResponsiveStyle]);
};

export default useStyledProps;
