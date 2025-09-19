import { useCallback, useMemo } from 'react';

import { get, map } from 'lodash';
import { useColorScheme } from 'react-native';

import { StyleContextType } from '../types';
import { isColorString } from '../utils';

import useStyle from './useStyle';

const useTheme = (customStyleConfig?: StyleContextType) => {
  const { themeConfig } = useStyle(customStyleConfig);

  const colorScheme = useColorScheme();

  const theme = useMemo(() => {
    if (themeConfig.variant === 'auto') {
      return colorScheme ? themeConfig[colorScheme] : themeConfig.light;
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

  const getColors = (...colors: string[]) => {
    return map(colors, getColor);
  };

  return {
    theme,
    themeConfig,
    colorScheme,
    getColor,
    getColors,
  };
};

export default useTheme;
