import { createContext, useContext } from 'react';

/**
 * API response state, keyed by the part of a request's state key after the
 * `api.` namespace (`{ login: { loading, data, error, status } }`).
 */
export type ApiState = Record<string, unknown>;

/**
 * Context holding API response state. Kept apart from the data-state context
 * so a nested `StateProvider` (a frame's data state, a list row) never shadows
 * it. Defaults to `null`: without a request runtime mounted, `api.*` bindings
 * fall through to their `altValue`.
 */
const ApiStateContext = createContext<ApiState | null>(null);

export const ApiStateContextProvider = ApiStateContext.Provider;

/** The API response state, or `null` when no request runtime is mounted. */
export const useApiState = (): ApiState | null => useContext(ApiStateContext);

export default ApiStateContext;
