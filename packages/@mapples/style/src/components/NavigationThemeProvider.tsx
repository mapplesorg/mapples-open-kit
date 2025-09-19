import { FC, PropsWithChildren, useMemo } from 'react';

import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { mapValues } from 'lodash';

import { useTheme } from '../hooks';
import { NativeThemeColors } from '../types';

export interface NavigationThemeProviderProps {
  themeColors: Partial<NativeThemeColors>;
}

const NavigationThemeProvider: FC<
  PropsWithChildren<NavigationThemeProviderProps>
> = ({ children, themeColors }) => {
  const { colorScheme, themeConfig, getColor } = useTheme();

  const nativeTheme = useMemo(() => {
    if (themeConfig.variant === 'auto') {
      return colorScheme === 'dark' ? DarkTheme : DefaultTheme;
    }
    return DefaultTheme;
  }, [colorScheme, themeConfig.variant]);

  const themeColorsMap = useMemo(() => {
    return mapValues(themeColors, getColor);
  }, [getColor, themeColors]);

  return (
    <ThemeProvider
      value={{
        ...nativeTheme,
        colors: { ...nativeTheme.colors, ...themeColorsMap },
      }}
    >
      {children}
    </ThemeProvider>
  );
};

export default NavigationThemeProvider;
