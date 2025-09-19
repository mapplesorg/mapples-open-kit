import { FC, PropsWithChildren } from 'react';

import { StyleContextProvider } from '../context';
import { StyleContextType } from '../types';

import ResponsiveStyleProvider from './ResponsiveStyleProvider';

/**
 * Props for the StyleProvider component.
 */
export interface StyleProviderProps {
  /** The style configuration object containing theme, typography, sizing, and responsive settings */
  style: StyleContextType;
}

/**
 * Provider component that wraps the application with style configuration and responsive context.
 * This component should be placed at the root of your application to provide style context
 * to all child components.
 *
 * @param props - The component props
 * @param props.style - The style configuration object
 * @param props.children - Child components to be wrapped with style context
 *
 * @example
 * ```tsx
 * import { StyleProvider } from '@mapples/style';
 *
 * const App = () => {
 *   const styleConfig = {
 *     themeConfig: {
 *       variant: 'auto',
 *       defaultColor: '#000000',
 *       light: { colors: { primary: '#007AFF' } },
 *       dark: { colors: { primary: '#0A84FF' } }
 *     },
 *     typographyConfig: {
 *       fontFamily: 'System',
 *       default: 'body',
 *       typography: { body: { fontSize: 16 } }
 *     }
 *   };
 *
 *   return (
 *     <StyleProvider style={styleConfig}>
 *       <MyApp />
 *     </StyleProvider>
 *   );
 * };
 * ```
 */
const StyleProvider: FC<PropsWithChildren<StyleProviderProps>> = ({
  style,
  children,
}) => {
  return (
    <StyleContextProvider value={style}>
      <ResponsiveStyleProvider>{children}</ResponsiveStyleProvider>
    </StyleContextProvider>
  );
};

export default StyleProvider;
