import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { VARIABLES_NAMESPACE, VariableDefinition } from '@mapples/types';
import { cloneDeep, get, set } from 'lodash';

import { WritableStateContextProvider } from './context';
import { VariablesProviderProps, WritableStateContextType } from './types';

const NS_PREFIX = `${VARIABLES_NAMESPACE}.`;

/** Coerce a root-level write to the variable's declared type. */
const coerce = (value: unknown, type: VariableDefinition['type']): unknown => {
  if (value == null) return value;
  switch (type) {
    case 'string':
      return typeof value === 'string' ? value : String(value);
    case 'number': {
      if (typeof value === 'number') return isNaN(value) ? 0 : value;
      const parsed = Number(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    case 'boolean':
      if (typeof value === 'boolean') return value;
      if (value === 'true') return true;
      if (value === 'false') return false;
      return Boolean(value);
    default:
      return value;
  }
};

/**
 * Root store for the project's writable variables, exposed to bindings and
 * conditions under `vars.*`.
 *
 * Owns ALL variable values: app-scoped ones seed on mount and live for the
 * provider's lifetime; page-scoped ones mount/unmount through
 * `VariablesScope` (registered by `pageUuid`), so leaving a page naturally
 * resets its variables. A single store (rather than nested per-page
 * providers) keeps `mapples:setState` handling in one place — exactly one
 * `StateActionHandler` should be mounted inside this provider.
 *
 * Runtime writes are kept as overrides on top of the declared initial
 * values, so editing an `initialValue` in the Creator immediately shows
 * through for variables that haven't been written yet.
 */
const VariablesProvider: FC<PropsWithChildren<VariablesProviderProps>> = ({
  children,
  document,
  storage,
}) => {
  /** Mount counts per pageUuid (a page can appear in several frames). */
  const [scopes, setScopes] = useState<Record<string, number>>({});
  /**
   * Latest committed mount counts, for `unregisterScope`. That callback has
   * to keep a stable identity — `VariablesScope` unregisters from an effect
   * cleanup, so a new identity would tear down and re-register every scope —
   * which rules out closing over `scopes` directly.
   */
  const scopesRef = useRef(scopes);
  useEffect(() => {
    scopesRef.current = scopes;
  }, [scopes]);
  /** Values explicitly written at runtime, keyed by variable name. */
  const [overrides, setOverrides] = useState<Record<string, unknown>>({});

  const variables = document?.variables;

  /** Currently-mounted definitions keyed by name. */
  const mounted = useMemo(() => {
    const result: Record<string, VariableDefinition> = {};
    for (const variable of Object.values(variables ?? {})) {
      const isMounted =
        variable.scope.kind === 'app' || !!scopes[variable.scope.pageUuid];
      if (isMounted) result[variable.name] = variable;
    }
    return result;
  }, [variables, scopes]);

  const value = useMemo(() => {
    const result: Record<string, unknown> = {};
    for (const variable of Object.values(mounted)) {
      result[variable.name] =
        variable.name in overrides
          ? overrides[variable.name]
          : variable.initialValue;
    }
    return result;
  }, [mounted, overrides]);

  // Load persisted app-variable values once per storage/document pair.
  useEffect(() => {
    if (!storage || !variables) return;
    let cancelled = false;
    for (const variable of Object.values(variables)) {
      if (!variable.persist || variable.scope.kind !== 'app') continue;
      void storage.get(variable.name).then((stored) => {
        if (cancelled || stored === undefined) return;
        setOverrides((current) => ({ ...current, [variable.name]: stored }));
      });
    }
    return () => {
      cancelled = true;
    };
  }, [storage, variables]);

  const setValue = useCallback<WritableStateContextType['setValue']>(
    (path, nextValue) => {
      const relative = path.startsWith(NS_PREFIX)
        ? path.slice(NS_PREFIX.length)
        : path;
      const [name, ...rest] = relative.split('.');
      const variable = mounted[name];

      if (!variable) {
        console.warn(
          `[mapples-state] setValue ignored: no mounted variable "${name}"`,
        );
        return;
      }

      let resolved: unknown;
      if (rest.length === 0) {
        resolved = coerce(nextValue, variable.type);
      } else {
        const base = cloneDeep(
          value[name] ?? (variable.type === 'array' ? [] : {}),
        );
        set(base as object, rest.join('.'), nextValue);
        resolved = base;
      }

      setOverrides((current) => ({ ...current, [name]: resolved }));

      if (variable.persist && variable.scope.kind === 'app' && storage) {
        void storage.set(name, resolved);
      }
    },
    // Reading `mounted`/`value` straight from render is free here: the
    // context object is rebuilt whenever `value` changes anyway, so pinning
    // this callback's identity never saved a re-render.
    [mounted, value, storage],
  );

  const reset = useCallback<WritableStateContextType['reset']>((names) => {
    setOverrides((current) => {
      if (!names) return {};
      const next = { ...current };
      for (const name of names) delete next[name];
      return next;
    });
  }, []);

  const registerScope = useCallback((pageUuid: string) => {
    setScopes((current) => ({
      ...current,
      [pageUuid]: (current[pageUuid] ?? 0) + 1,
    }));
  }, []);

  const unregisterScope = useCallback(
    (pageUuid: string) => {
      const lastMount = (scopesRef.current[pageUuid] ?? 0) <= 1;
      setScopes((current) => {
        const count = (current[pageUuid] ?? 0) - 1;
        const next = { ...current };
        if (count <= 0) delete next[pageUuid];
        else next[pageUuid] = count;
        return next;
      });
      if (!lastMount) return;
      // Last unmount discards the page's runtime values.
      const pageNames = Object.values(variables ?? {})
        .filter((v) => v.scope.kind === 'page' && v.scope.pageUuid === pageUuid)
        .map((v) => v.name);
      if (pageNames.length) reset(pageNames);
    },
    [variables, reset],
  );

  const context = useMemo<WritableStateContextType>(
    () => ({ value, setValue, reset, registerScope, unregisterScope }),
    [value, setValue, reset, registerScope, unregisterScope],
  );

  return (
    <WritableStateContextProvider value={context}>
      {children}
    </WritableStateContextProvider>
  );
};

/** Read a `vars.`-prefixed (or bare) path from a writable-store value. */
export const getVariableValue = (
  storeValue: Record<string, unknown>,
  path: string,
  altValue?: unknown,
): unknown => {
  const relative = path.startsWith(NS_PREFIX)
    ? path.slice(NS_PREFIX.length)
    : path;
  if (relative === VARIABLES_NAMESPACE || relative === '') return storeValue;
  return get(storeValue, relative, altValue);
};

export default VariablesProvider;
