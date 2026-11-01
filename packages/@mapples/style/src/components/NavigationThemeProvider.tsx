import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
} from 'react';

import { ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import { mapValues } from 'lodash';
import { ColorValue } from 'react-native';

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
  const { scheme, getColor } = useTheme();

  const nativeTheme = useMemo(
    () => (scheme === 'dark' ? DarkTheme : DefaultTheme),
    [scheme],
  );

  const theme = useMemo<NavigationTheme>(
    () => ({
      ...nativeTheme,
      colors: mapValues(
        { ...nativeTheme.colors, ...mapValues(themeColors, getColor) },
        (value, name) => colorString(name, value),
      ) as NavigationTheme['colors'],
    }),
    [getColor, nativeTheme, themeColors],
  );

  return (
    <ThemeProvider value={theme}>
      <NavigationThemeContext.Provider value={theme}>
        {children}
      </NavigationThemeContext.Provider>
    </ThemeProvider>
  );
};

/**
 * The navigation theme with every color a string — what both expo-router's
 * vendored React Navigation (`ColorValue`) and React Navigation itself
 * (`string`) accept, so one theme serves an expo-router app and a
 * `MapplesNavigation` tree inside it.
 */
export type NavigationTheme = Omit<typeof DefaultTheme, 'colors'> & {
  colors: Record<keyof (typeof DefaultTheme)['colors'], string>;
};

const NavigationThemeContext = createContext<NavigationTheme | undefined>(
  undefined,
);

/**
 * The theme the nearest {@link NavigationThemeProvider} gives expo-router's
 * navigators, for a navigation tree of another React Navigation copy (the
 * container of `MapplesNavigation`) that does not read expo-router's context.
 */
export const useNavigationTheme = (): NavigationTheme | undefined =>
  useContext(NavigationThemeContext);

/** The base themes and the style theme resolve colors to strings; anything else is a theme defect. */
const colorString = (name: string, value: ColorValue): string => {
  if (typeof value !== 'string') {
    throw new Error(`Navigation theme color "${name}" is not a color string`);
  }
  return value;
};

export default NavigationThemeProvider;
