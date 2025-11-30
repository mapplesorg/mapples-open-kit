import { useEffect, useMemo, useState } from 'react';

import { isArray, isEqual, isObject, mapValues, replace } from 'lodash';

import { getThemeRegexp, isCalc, isMultiply } from '../utils';

import useResponsive from './useResponsive';
import useSizing from './useSizing';
import useTheme from './useTheme';

/**
 * Checks if a value is a boxShadow object with the expected structure.
 *
 * @param value - The value to check
 * @returns True if the value is a boxShadow object
 */
const isBoxShadowObject = (value: unknown): value is {
  color?: string;
  x?: number;
  y?: number;
  radius?: number;
} => {
  return (
    isObject(value) &&
    !isArray(value) &&
    ('x' in value || 'y' in value || 'radius' in value || 'color' in value)
  );
};

/**
 * Converts a boxShadow object to a CSS box-shadow string.
 *
 * @param boxShadow - The boxShadow object to convert
 * @param getColor - Function to resolve theme color references
 * @returns CSS box-shadow string
 */
const parseBoxShadow = (
  boxShadow: { color?: string; x?: number; y?: number; radius?: number },
  getColor: (color: string) => string,
): string => {
  const x = boxShadow.x ?? 0;
  const y = boxShadow.y ?? 0;
  const radius = boxShadow.radius ?? 0;
  const color = boxShadow.color
    ? getColor(boxShadow.color)
    : 'rgba(0, 0, 0, 0.25)';

  return `${x}px ${y}px ${radius}px ${color}`;
};

/**
 * Hook to process styled objects with theme and sizing interpolation and responsive parsing.
 *
 * @param styled - The styled object containing theme and sizing references
 * @returns Processed styled object with resolved theme colors, sizing values, and responsive styles
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { getStyled } = useStyled();
 *
 *   const processedStyle = getStyled({
 *     backgroundColor: 'theme.colors.primary',
 *     padding: 'sizing.md',
 *     fontSize: '2*', // 2 times base size
 *     '&:tablet': { fontSize: '3*' }
 *   });
 *
 *   return <View style={processedStyle}>Styled content</View>;
 * };
 * ```
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const styled = useStyled({
 *     container: {
 *       backgroundColor: 'theme.colors.background',
 *       padding: 'sizing.lg',
 *       '&:mobile': { padding: 'sizing.sm' }
 *     },
 *     text: {
 *       color: 'theme.colors.text',
 *       fontSize: 'sizing.base'
 *     }
 *   });
 *
 *   return (
 *     <View style={styled.container}>
 *       <Text style={styled.text}>Responsive styled content</Text>
 *     </View>
 *   );
 * };
 * ```
 */
const useStyled = <T extends object>(styled?: T) => {
  const { theme, getColor } = useTheme();
  const { sizing, getSize } = useSizing();
  const { getResponsiveStyle } = useResponsive();

  const [styledValue, setStyledValue] = useState<T | undefined>(styled);

  useEffect(() => {
    if (!isEqual(styled, styledValue)) {
      setStyledValue(styled);
    }
  }, [styled, styledValue]);

  return useMemo(() => {
    if (!styledValue) {
      return {};
    }

    const stringifyProps = JSON.stringify(styledValue);
    const pattern = getThemeRegexp({ theme, sizing });

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

    const result = (JSON.parse(replaced) ?? {}) as T | T[];

    // Process boxShadow objects
    const processBoxShadow = (obj: any): any => {
      if (isArray(obj)) {
        return obj.map(processBoxShadow);
      }

      if (isObject(obj) && !isArray(obj)) {
        return mapValues(obj, (value, key) => {
          if (key === 'boxShadow' && isBoxShadowObject(value)) {
            return parseBoxShadow(value, getColor);
          }

          if (isObject(value) && !isArray(value)) {
            return processBoxShadow(value);
          }

          return value;
        });
      }

      return obj;
    };

    const processedResult = processBoxShadow(result);

    if (isArray(processedResult)) {
      return processedResult.map((item) => mapValues(item, getResponsiveStyle));
    }

    return mapValues(processedResult, getResponsiveStyle);
  }, [getColor, getResponsiveStyle, getSize, sizing, styledValue, theme]);
};

export default useStyled;
