import { useContext } from 'react';

import { RenderContext } from '../context';

/**
 * Hook to access the render context.
 * 
 * This hook provides access to the registered components and other render
 * context data. It should be used within components that are wrapped by
 * a RenderProvider.
 * 
 * @returns {RenderContextType} The render context containing registered components
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { components } = useRender();
 *   const ButtonComponent = components['Button']?.Component;
 *   
 *   return ButtonComponent ? <ButtonComponent /> : null;
 * };
 * ```
 * 
 * @throws {Error} If used outside of a RenderProvider context
 */
const useRender = () => {
  return useContext(RenderContext);
};

export default useRender;
