import { createContext } from 'react';

import { StateCondition } from '../types';

/**
 * React context for render-level state conditions.
 *
 * Carries a map of named {@link StateCondition} objects that drive conditional
 * styling inside the render tree. The value is `undefined` when no state has
 * been provided (i.e. when the component is rendered outside a
 * {@link RenderStateContextProvider}).
 *
 * @example
 * ```tsx
 * const state = useContext(RenderStateContext);
 * const condition = state?.['isActive'];
 * ```
 */
const RenderStateContext = createContext<
  Record<string, StateCondition> | undefined
>(undefined);

/**
 * Provider component for {@link RenderStateContext}.
 *
 * Wrap a subtree with this provider to supply state conditions used for
 * conditional styling and rendering.
 *
 * @example
 * ```tsx
 * <RenderStateContextProvider value={stateConditions}>
 *   <RenderComponent {...componentDef} />
 * </RenderStateContextProvider>
 * ```
 */
export const RenderStateContextProvider = RenderStateContext.Provider;

export default RenderStateContext;
