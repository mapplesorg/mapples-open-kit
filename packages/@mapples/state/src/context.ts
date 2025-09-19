import { createContext } from 'react';

import { StateContextType } from './types';

/**
 * React context for managing application state.
 *
 * This context provides a centralized way to share state data across components
 * in the application tree. The context contains a value object that can be
 * accessed by any child component using the useDataState hook.
 *
 * @example
 * ```tsx
 * // Access the context in a component
 * const { value } = useContext(StateContext);
 * ```
 */
const StateContext = createContext<StateContextType>({
  value: {},
});

/**
 * Provider component for the StateContext.
 *
 * This is the actual provider component that should be used to wrap
 * components that need access to the state context.
 */
export const StateContextProvider = StateContext.Provider;

export default StateContext;
