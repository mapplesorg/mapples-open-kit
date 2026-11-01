import { VariablesDocument } from '@mapples/types';

/**
 * The writable variables store exposed under the `vars.` namespace.
 *
 * Lives in a context parallel to (never shadowed by) the read-only
 * `StateContext`, so `vars.*` bindings resolve identically inside list
 * rows, request scopes and sample-data scopes.
 */
export interface WritableStateContextType {
  /** Current variable values keyed by name (bound as `vars.<name>`). */
  value: Record<string, unknown>;
  /**
   * Whether the persisted app variables have been loaded from the host
   * storage. `false` only between mount and the moment every stored value
   * has arrived (or failed to); a guard that reads a persisted session must
   * wait for it, or a signed-in user reads as signed out for that moment.
   */
  hydrated: boolean;
  /**
   * Path-based write. `path` is `vars.`-prefixed (matching binding syntax);
   * root writes are coerced to the variable's declared type, nested writes
   * into object/array variables are set raw. Unknown variables warn + no-op,
   * and return `false`; a queued write returns `true`.
   */
  setValue: (path: string, value: unknown) => boolean;
  /** Reset named variables (or all currently mounted) to initial values. */
  reset: (names?: string[]) => void;
  /**
   * Mount a page's variables while its scope is on screen. Used by
   * `VariablesScope` — not meant for application code.
   */
  registerScope: (pageUuid: string) => void;
  /** Unmount a page's variables, discarding their runtime values. */
  unregisterScope: (pageUuid: string) => void;
}

/** Host persistence adapter for `persist: true` app variables. */
export interface VariablesStorage {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
}

export interface VariablesProviderProps {
  /** The project's variables document; absent → provider is inert. */
  document?: VariablesDocument | null;
  /** Optional persistence for `persist: true` app-scoped variables. */
  storage?: VariablesStorage;
}

export interface VariablesScopeProps {
  /** The page whose page-scoped variables mount with this subtree. */
  pageUuid: string;
}
