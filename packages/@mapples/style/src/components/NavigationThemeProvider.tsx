import { FC, PropsWithChildren, useMemo } from 'react';

import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { mapValues } from 'lodash';

import { useTheme } from '../hooks';
import { NativeThemeColors } from '../types';

/**
 * Props for the NavigationThemeProvider component.
 */
export interface NavigationThemeProviderProps {
  /** Custom theme colors to override the default navigation theme colors */
  themeColors: Partial<NativeThemeColors>;
}

/**
 * Provider component that integrates the style system with React Navigation theming.
 * This component automatically applies the current theme colors to React Navigation components
 * and provides theme-aware navigation styling.
 * 
 * @param props - The component props
 * @param props.themeColors - Custom theme colors to override navigation defaults
 * @param props.children - Child components to be wrapped with navigation theme
 * 
 * @example
 * ```tsx
 * import { NavigationThemeProvider } from '@mapples/style';
 * 
 * const App = () => {
 *   return (
 *     <NavigationThemeProvider
 *       themeColors={{
 *         primary: 'theme.colors.primary',
 *         background: 'theme.colors.background',
 *         card: 'theme.colors.surface'
 *       }}
 *     >
 *       <NavigationContainer>
 *         <Stack.Navigator>
 *           <Stack.Screen name="Home" component={HomeScreen} />
 *         </Stack.Navigator>
 *       </NavigationContainer>
 *     </NavigationThemeProvider>
 *   );
 * };
 * ```
 */
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
