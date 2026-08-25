import { FC, PropsWithChildren, JSX, useEffect } from 'react';

import { Components } from '@mapples/components';
import { FONT_FILES } from '@mapples/fonts';
import { AnyObject, RenderProvider } from '@mapples/render';
import { StyleContextType, StyleProvider, Styler } from '@mapples/style';
import { UIComponents } from '@mapples/ui';
import { useFonts } from 'expo-font';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import assetsConfig from 'mapples::assets';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import navigationConfig from 'mapples::navigation';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import styleConfig from 'mapples::style';

import { NavigationMap, NavigationProvider } from './NavigationContext';
import { remapFonts } from './utils';

/**
 * Props for the MapplesApp component.
 *
 * @interface MapplesAppProps
 */
export interface MapplesAppProps {
  /** Optional custom style configuration to override the default Mapples styling */
  style?: StyleContextType;
  /** Optional custom assets configuration to override the default Mapples assets */
  assets?: AnyObject;
  /** Optional navigation map (Mapples action `routeName` → expo-router href) for navigation actions */
  navigation?: NavigationMap;
  /** Custom loading indicator component to display while fonts are loading */
  FontLoadingIndicator?: JSX.Element;
  /** Font loaded callback **/
  onFontLoaded?: () => void;
}

/**
 * The main MapplesApp component that provides the core Mapples ecosystem functionality.
 *
 * This component sets up the essential providers for styling, rendering, and asset management
 * that are required for all Mapples applications. It handles font loading and provides
 * a unified entry point for the Mapples ecosystem.
 *
 * @component
 * @param props - The component props
 * @param props.children - The application content to render inside the Mapples providers
 * @returns The configured Mapples app with all necessary providers
 *
 * @example
 * ```tsx
 * import MapplesApp from '@mapples/app';
 *
 * function App() {
 *   return (
 *     <MapplesApp>
 *       <YourAppContent />
 *     </MapplesApp>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * import MapplesApp from '@mapples/app';
 *
 * function App() {
 *   return (
 *     <MapplesApp
 *       showFontLoadingIndicator={true}
 *       FontLoadingIndicator={<LoadingSpinner />}
 *     >
 *       <YourAppContent />
 *     </MapplesApp>
 *   );
 * }
 * ```
 */
const MapplesApp: FC<PropsWithChildren<MapplesAppProps>> = ({
  children,
  style,
  assets,
  navigation,
  FontLoadingIndicator,
  onFontLoaded,
}) => {
  const [loaded] = useFonts({
    ...FONT_FILES,
    ...remapFonts(assets || assetsConfig),
  });

  useEffect(() => {
    if (loaded && onFontLoaded) {
      onFontLoaded();
    }
  }, [loaded, onFontLoaded]);

  // Gate the entire subtree on font readiness regardless of `onFontLoaded`.
  // Otherwise `children` mount on the first render with `loaded === false`,
  // laying out `Text` with the fallback font; components that don't re-render
  // after `loaded` flips keep the fallback (the intermittent "not all fonts"
  // race). Returning here blocks until fonts are ready; `onFontLoaded` still
  // fires from the effect above so consumers can hide their splash in sync.
  if (!loaded) {
    return FontLoadingIndicator ?? null;
  }

  return (
    <StyleProvider style={Styler.init(style || styleConfig)}>
      <RenderProvider
        components={{ ...Components, ...UIComponents }}
        assets={assets || assetsConfig}
      >
        <NavigationProvider navigation={navigation || navigationConfig}>
          {children}
        </NavigationProvider>
      </RenderProvider>
    </StyleProvider>
  );
};

export default MapplesApp;
