import { createContext } from 'react';

import { RenderContextType } from '../types';

/**
 * React context for the render system.
 * Provides access to registered components throughout the component tree.
 * 
 * This context is used by the RenderProvider to make registered components
 * available to all child components in the render tree.
 * 
 * @example
 * ```tsx
 * const { components } = useContext(RenderContext);
 * const Component = components['Button']?.Component;
 * ```
 */
const RenderContext = createContext<RenderContextType>({
  components: {},
});

/**
 * Provider component for the RenderContext.
 * Use this to wrap your application and provide registered components
 * to the render system.
 * 
 * @example
 * ```tsx
 * <RenderContextProvider value={{ components: registeredComponents }}>
 *   <App />
 * </RenderContextProvider>
 * ```
 */
export const RenderContextProvider = RenderContext.Provider;

export default RenderContext;
