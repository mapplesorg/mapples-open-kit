import { createContext } from 'react';

/**
 * React context for drop area hierarchy.
 * Provides access to the parent drop target ID for establishing parent-child relationships.
 * @public
 */
/**
 * Sentinel `DropArea.forId` value for "my parent has not registered yet".
 * Children under it stay MOUNTED but defer their own registration until the
 * real parent id replaces it — keeping the tree stable (no unmount/remount)
 * across registration gaps, e.g. an editor re-enabling its drop targets when
 * leaving a preview mode. Distinct from `null`, which means a true root.
 */
export const DROP_PARENT_PENDING = -1;

const DropContext = createContext<{ parent: number | null }>({
  parent: null,
});

/**
 * Provider component for the drop context.
 * @public
 */
export const DropContextProvider = DropContext.Provider;

export default DropContext;
