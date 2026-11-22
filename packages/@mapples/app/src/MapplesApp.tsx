import {
  createContext,
  FC,
  PropsWithChildren,
  JSX,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import { Components } from '@mapples/components';
import { AnyObject, RenderProvider } from '@mapples/render';
import {
  StyleContextType,
  StyleProvider,
  Styler,
  ThemeVariantProvider,
} from '@mapples/style';
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

import { splitLibraryFonts } from './libraryFonts';
import { NavigationMap, NavigationProvider } from './NavigationContext';
import { registerLazyFonts } from './registerLazyFonts';
import MapplesRuntime, { MapplesRuntimeProps } from './runtime/MapplesRuntime';
import { MapplesProject, syncedProject } from './runtime/project';
import { resolveAssets, toStyleContext } from './utils';

const rootStyle = { flex: 1 } as const;

/**
 * Set by the outermost MapplesApp. A MapplesApp below one (the CLI's
 * generated root layout inside an app whose own root layout mounts
 * MapplesApp) passes its children through, so the providers and any style
 * context override made between the two keep reaching the screens.
 */
const MapplesAppMounted = createContext(false);

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
   * The navigation, API, variables and locales documents the behaviour
   * runtime executes. Defaults to the files `mapples sync` writes
   * (`navigation.ts`, `api.ts`, `variables.ts`, `locales.ts` in the CLI's
   * mapplesDir).
   */
  project?: MapplesProject;
  /** Persistence for `persist: true` app variables. */
  variablesStorage?: MapplesRuntimeProps['variablesStorage'];
  /** Performs API requests (default: direct `fetch` with the synced secrets). */
  transport?: MapplesRuntimeProps['transport'];
  /** A state path (`vars.theme`) whose `light` / `dark` / `auto` value switches the theme at runtime. */
  themeVariable?: MapplesRuntimeProps['themeVariable'];
  /** Pins the app's locale to one the project supports (default: the device's, then the user's choice). */
  locale?: MapplesRuntimeProps['locale'];
}

/**
 * The main MapplesApp component that provides the core Mapples ecosystem functionality.
 *
 * This component sets up the essential providers for styling, rendering, and asset management
 * that are required for all Mapples applications. It handles font loading and provides
 * a unified entry point for the Mapples ecosystem.
 *
 * Mount it once. A MapplesApp inside another one (an app's root layout and
 * the `mapples` CLI's generated navigator layout below it) passes its
 * children through, so whatever the outer one provides — and any style
 * context override made between the two — reaches every screen.
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
const MapplesApp: FC<PropsWithChildren<MapplesAppProps>> = (props) => {
  const mounted = useContext(MapplesAppMounted);
  return mounted ? (
    <MapplesAppPassThrough {...props} />
  ) : (
    <MapplesAppRoot {...props} />
  );
};

/** A MapplesApp inside another: the outer one's providers serve its children. */
const MapplesAppPassThrough: FC<PropsWithChildren<MapplesAppProps>> = ({
  children,
  ...props
}) => {
  const ignored = Object.keys(props).join(', ');
  useEffect(() => {
    if (ignored === '') return;
    console.warn(
      `[@mapples/app] MapplesApp is already mounted above this one, which passes its children through and ignores ${ignored} — set them on the outer MapplesApp`,
    );
  }, [ignored]);
  return <>{children}</>;
};

const MapplesAppRoot: FC<PropsWithChildren<MapplesAppProps>> = ({
  children,
  style,
  assets,
  navigation,
  FontLoadingIndicator,
  onFontLoaded,
  project,
  variablesStorage,
  transport,
  themeVariable,
  locale,
}) => {
  const runtimeProject = useMemo(() => project ?? syncedProject(), [project]);
  const resolved = useMemo(
    () => resolveAssets(assets ?? assetsModule),
    [assets],
  );
  const styleContext = useMemo(
    () => Styler.init(style ?? toStyleContext(themeModule)),
    [style],
  );
  const libraryFonts = useMemo(
    () => splitLibraryFonts(styleContext),
    [styleContext],
  );
  const [loaded] = useFonts({ ...libraryFonts.awaited, ...resolved.fonts });

  useEffect(() => {
    registerLazyFonts(libraryFonts.lazy);
  }, [libraryFonts]);

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
      <MapplesAppMounted.Provider value>
        <ThemeVariantProvider>
          <StyleProvider style={styleContext}>
            <RenderProvider
              components={{ ...Components, ...UIComponents }}
              assets={resolved.assets}
            >
              <NavigationProvider navigation={navigation}>
                <MapplesRuntime
                  project={runtimeProject}
                  variablesStorage={variablesStorage}
                  transport={transport}
                  themeVariable={themeVariable}
                  locale={locale}
                >
                  {children}
                </MapplesRuntime>
              </NavigationProvider>
            </RenderProvider>
          </StyleProvider>
        </ThemeVariantProvider>
      </MapplesAppMounted.Provider>
    </GestureHandlerRootView>
  );
};

export default MapplesApp;
