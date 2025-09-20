import { createContext } from 'react';

/**
 * React context for drop area hierarchy.
 * Provides access to the parent drop target ID for establishing parent-child relationships.
 * @public
 */
const DropContext = createContext<{ parent: number | null }>({
  parent: null,
});

/**
 * Provider component for the drop context.
 * @public
 */
export const DropContextProvider = DropContext.Provider;

export default DropContext;
