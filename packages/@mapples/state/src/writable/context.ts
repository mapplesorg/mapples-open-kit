import { createContext, useContext } from 'react';

import { WritableStateContextType } from './types';

/**
 * Context holding the writable variables store. Defaults to `null` so apps
 * that never mount a `VariablesProvider` keep today's read-only behavior —
 * `vars.*` bindings simply fall through to their `altValue`.
 */
const WritableStateContext = createContext<WritableStateContextType | null>(
  null,
);

export const WritableStateContextProvider = WritableStateContext.Provider;

/** The writable variables store, or `null` when no provider is mounted. */
export const useVariablesState = (): WritableStateContextType | null =>
  useContext(WritableStateContext);

export default WritableStateContext;
