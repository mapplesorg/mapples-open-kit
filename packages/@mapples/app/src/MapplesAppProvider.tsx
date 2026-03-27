import { FC, PropsWithChildren, JSX } from 'react';

import { Components } from '@mapples/components';
import { AnyObject, RenderProvider } from '@mapples/render';
import { StyleContextType, StyleProvider, Styler } from '@mapples/style';
import { UIComponents } from '@mapples/ui';
import { useFonts } from 'expo-font';

import { remapFonts } from './utils';

/**
 * Props for the MapplesApp component.
 *
 * @interface MapplesAppProps
 */
export interface MapplesAppProps {
  /** Optional custom style configuration to override the default Mapples styling */
  style: StyleContextType;
  /** Optional custom assets configuration to override the default Mapples assets */
  assets: AnyObject;
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
  showFontLoadingIndicator,
  FontLoadingIndicator,
}) => {
  const [loaded] = useFonts(remapFonts(assets));

  if (!loaded && showFontLoadingIndicator) {
    return FontLoadingIndicator || null;
  }

  return (
    <StyleProvider style={Styler.init(style)}>
      <RenderProvider
        components={{ ...Components, ...UIComponents }}
        assets={assets}
      >
        {children}
      </RenderProvider>
    </StyleProvider>
  );
};

export default MapplesApp;
