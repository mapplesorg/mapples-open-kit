import { FC, PropsWithChildren } from 'react';

import { RenderContextProvider } from '../context';
import { RenderContextType } from '../types';

/**
 * Provider component that makes registered components available to the render system.
 *
 * This component wraps your application and provides the registered components
 * to all child components through React context. It's essential for the render
 * system to function properly as it makes components available for dynamic rendering.
 *
 * @param props - The component props
 * @param props.components - Map of registered components available for rendering
 * @param props.assets - Map of asset references (e.g. images, icons) resolved by `useRefProps`
 * @param props.children - Child components to render
 *
 * @example
 * ```tsx
 * const registeredComponents = {
 *   Button: { Component: MyButton },
 *   Text: { Component: MyText },
 *   View: { Component: MyView }
 * };
 *
 * const App = () => (
 *   <RenderProvider components={registeredComponents}>
 *     <Render root={rootComponent} />
 *   </RenderProvider>
 * );
 * ```
 */
const RenderProvider: FC<PropsWithChildren<RenderContextType>> = ({
  components,
  children,
  assets,
}) => {
  return (
    <RenderContextProvider value={{ components, assets }}>
      {children}
    </RenderContextProvider>
  );
};

export default RenderProvider;
