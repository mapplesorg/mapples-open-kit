import { createContext } from 'react';

import { RenderContextType } from '../types';

/**
 * React context for canvas-based rendering.
 * Similar to RenderContext but specifically designed for canvas environments
 * where drag-and-drop interactions and canvas-specific rendering are needed.
 * 
 * This context provides access to registered components within a canvas
 * rendering context, enabling canvas-specific features like drag-and-drop
 * operations and canvas layout management.
 * 
 * @example
 * ```tsx
 * const { components } = useContext(RenderCanvasContext);
 * const CanvasComponent = components['CanvasView']?.Component;
 * ```
 */
const RenderCanvasContext = createContext<RenderContextType>({
  components: {},
});

/**
 * Provider component for the RenderCanvasContext.
 * Use this to wrap canvas-specific components and provide registered
 * components for canvas rendering operations.
 * 
 * @example
 * ```tsx
 * <RenderCanvasContextProvider value={{ components: canvasComponents }}>
 *   <CanvasRenderer />
 * </RenderCanvasContextProvider>
 * ```
 */
export const RenderCanvasContextProvider = RenderCanvasContext.Provider;

export default RenderCanvasContext;
