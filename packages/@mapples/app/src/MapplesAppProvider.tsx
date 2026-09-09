import { FC, PropsWithChildren, JSX } from 'react';

import { Components } from '@mapples/components';
import { FONT_FILES } from '@mapples/fonts';
import { AnyObject, RenderProvider } from '@mapples/render';
import { StyleContextType, StyleProvider, Styler } from '@mapples/style';
import { UIComponents } from '@mapples/ui';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { NavigationMap, NavigationProvider } from './NavigationContext';
import { remapFonts } from './utils';

const rootStyle = { flex: 1 } as const;

/**
 * Props for the MapplesApp component.
 *
 * @interface MapplesAppProps
 */
export interface MapplesAppProps {
  /** The style configuration for the Mapples styling system */
  style: StyleContextType;
  /** The assets configuration object containing font and image references */
  assets: AnyObject;
  /** Optional navigation map (Mapples action `routeName` → expo-router href) for navigation actions */
  navigation?: NavigationMap;
  /** Whether to show a loading indicator while fonts are loading */
  showFontLoadingIndicator?: boolean;
  /** Custom loading indicator component to display while fonts are loading */
  FontLoadingIndicator?: JSX.Element;
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
  showFontLoadingIndicator,
  FontLoadingIndicator,
}) => {
  const [loaded] = useFonts({ ...FONT_FILES, ...remapFonts(assets) });

  if (!loaded && showFontLoadingIndicator) {
    return FontLoadingIndicator || null;
  }

  return (
    // Gesture-driven library components (Slider, BottomSheet) need the
    // gesture-handler root; the canvas provides its own through DnDRootView.
    <GestureHandlerRootView style={rootStyle}>
      <StyleProvider style={Styler.init(style)}>
        <RenderProvider
          components={{ ...Components, ...UIComponents }}
          assets={assets}
        >
          <NavigationProvider navigation={navigation}>
            {children}
          </NavigationProvider>
        </RenderProvider>
      </StyleProvider>
    </GestureHandlerRootView>
  );
};

export default MapplesApp;
