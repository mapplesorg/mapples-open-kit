import { useCallback, useMemo } from 'react';

import { get, map } from 'lodash';
import { useColorScheme } from 'react-native';

import { StyleContextType } from '../types';
import { isColorString } from '../utils';

import useStyle from './useStyle';

/**
 * Hook to access and manage theme configuration with automatic color scheme detection.
 *
 * @param customStyleConfig - Optional custom style configuration to override the context value
 * @returns Object containing theme utilities and current theme state
 *
 * @returns theme - The current active theme object (light or dark)
 * @returns themeConfig - The complete theme configuration
 * @returns colorScheme - The current device color scheme ('light' | 'dark' | null)
 * @returns getColor - Function to resolve color values from theme paths
 * @returns getColors - Function to resolve multiple color values at once
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { theme, getColor, colorScheme } = useTheme();
 *
 *   return (
 *     <View style={{
 *       backgroundColor: getColor('theme.colors.background'),
 *       color: getColor('theme.colors.text')
 *     }}>
 *       <Text>Current scheme: {colorScheme}</Text>
 *     </View>
 *   );
 * };
 * ```
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { getColors } = useTheme();
 *   const [bgColor, textColor, borderColor] = getColors(
 *     'theme.colors.background',
 *     'theme.colors.text',
 *     'theme.colors.border'
 *   );
 *
 *   return (
 *     <View style={{ backgroundColor: bgColor, borderColor }}>
 *       <Text style={{ color: textColor }}>Multiple colors</Text>
 *     </View>
 *   );
 * };
 * ```
 */
const useTheme = (customStyleConfig?: StyleContextType) => {
  const { themeConfig } = useStyle(customStyleConfig);

  const colorScheme = useColorScheme();

  const theme = useMemo(() => {
    if (themeConfig.variant === 'auto') {
      return colorScheme === 'dark' ? themeConfig.dark : themeConfig.light;
    }

    return themeConfig[themeConfig.variant];
  }, [colorScheme, themeConfig]);

  const getColor = useCallback(
    (color: string) => {
      if (isColorString(color)) {
        return color;
      }

      const colorValue = get({ theme }, color);

      if (isColorString(colorValue)) {
        return colorValue;
      }

      return themeConfig.defaultColor;
    },
    [theme, themeConfig.defaultColor],
  );

  const getColors = useCallback(
    (...colors: string[]) => {
      return map(colors, getColor);
    },
    [getColor],
  );

  return {
    theme,
    themeConfig,
    colorScheme,
    getColor,
    getColors,
  };
};

export default useTheme;
