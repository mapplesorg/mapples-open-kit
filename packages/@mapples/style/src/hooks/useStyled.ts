import { useMemo } from 'react';

import { isArray, mapValues, replace } from 'lodash';

import { getThemeRegexp, isCalc, isMultiply } from '../utils';

import useResponsive from './useResponsive';
import useSizing from './useSizing';
import useTheme from './useTheme';

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

  const pattern = useMemo(
    () => getThemeRegexp({ theme, sizing }),
    [theme, sizing],
  );

  return useMemo(() => {
    if (!styled) {
      return {};
    }

    const stringifyProps = JSON.stringify(styled);

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

    if (isArray(result)) {
      return result.map((item) => mapValues(item, getResponsiveStyle));
    }

    return mapValues(result, getResponsiveStyle);
  }, [getColor, getResponsiveStyle, getSize, pattern, styled]);
};

export default useStyled;
