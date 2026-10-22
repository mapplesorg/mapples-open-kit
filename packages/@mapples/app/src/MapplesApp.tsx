import { FC, PropsWithChildren, JSX, useEffect, useMemo } from 'react';

import { Components } from '@mapples/components';
import { FONT_FILES } from '@mapples/fonts';
import { AnyObject, RenderProvider } from '@mapples/render';
import { StyleContextType, StyleProvider, Styler } from '@mapples/style';
import { UIComponents } from '@mapples/ui';
import { useFonts } from 'expo-font';
// The files `mapples sync` writes — resolved by `mapplesResolver`
// (`@mapples/app/expo`) to theme.ts and assetMap.ts in the app's mapplesDir,
// or to an empty module before the first sync.
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import * as assetsModule from 'mapples::assets';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import * as themeModule from 'mapples::style';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { NavigationMap, NavigationProvider } from './NavigationContext';
import MapplesRuntime, { MapplesRuntimeProps } from './runtime/MapplesRuntime';
import { MapplesProject, syncedProject } from './runtime/project';
import { resolveAssets, toStyleContext } from './utils';

const rootStyle = { flex: 1 } as const;

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
  /** Optional navigation map (Mapples action `routeName` → expo-router href); the CLI's generated expo-router layouts need none */
  navigation?: NavigationMap;
  /** Custom loading indicator component to display while fonts are loading */
  FontLoadingIndicator?: JSX.Element;
  /** Font loaded callback **/
  onFontLoaded?: () => void;
  /**
   * The navigation, API and variables documents the behaviour runtime
   * executes. Defaults to the files `mapples sync` writes
   * (`navigation.ts`, `api.ts`, `variables.ts` in the CLI's mapplesDir).
   */
  project?: MapplesProject;
  /** Persistence for `persist: true` app variables. */
  variablesStorage?: MapplesRuntimeProps['variablesStorage'];
  /** Performs API requests (default: direct `fetch` with the synced secrets). */
  transport?: MapplesRuntimeProps['transport'];
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
  project,
  variablesStorage,
  transport,
}) => {
  const runtimeProject = useMemo(() => project ?? syncedProject(), [project]);
  const resolved = useMemo(
    () => resolveAssets(assets ?? assetsModule),
    [assets],
  );
  const [loaded] = useFonts({ ...FONT_FILES, ...resolved.fonts });

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
    // Gesture-driven library components (Slider, BottomSheet) need the
    // gesture-handler root; the canvas provides its own through DnDRootView.
    <GestureHandlerRootView style={rootStyle}>
      <StyleProvider style={Styler.init(style ?? toStyleContext(themeModule))}>
        <RenderProvider
          components={{ ...Components, ...UIComponents }}
          assets={resolved.assets}
        >
          <NavigationProvider navigation={navigation}>
            <MapplesRuntime
              project={runtimeProject}
              variablesStorage={variablesStorage}
              transport={transport}
            >
              {children}
            </MapplesRuntime>
          </NavigationProvider>
        </RenderProvider>
      </StyleProvider>
    </GestureHandlerRootView>
  );
};

export default MapplesApp;
