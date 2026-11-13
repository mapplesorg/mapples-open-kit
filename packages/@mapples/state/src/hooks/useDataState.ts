import { useCallback, useContext } from 'react';

import {
  conditionMap,
  Conditions,
  isCondition,
  isDataThis,
  parseCondition,
  parseJoin,
  toBool,
  toNumber,
} from '@mapples/inlang';
import {
  API_NAMESPACE,
  DataProp,
  formatMessage,
  formatValue,
  LOCALE_NAMESPACE,
  MESSAGES_NAMESPACE,
  parseValueFormat,
  ROUTE_NAMESPACE,
  TAB_NAMESPACE,
  VARIABLES_NAMESPACE,
} from '@mapples/types';
import { get, join } from 'lodash';

import { useApiState } from '../api/context';
import StateContext from '../context';
import { useLocaleState } from '../locale/context';
import { useActiveRoute, useRouteParams } from '../route/context';
import { useTabScope } from '../tab/context';
import { useVariablesState } from '../writable/context';

const NS_PREFIX = `${VARIABLES_NAMESPACE}.`;
const API_PREFIX = `${API_NAMESPACE}.`;
const ROUTE_PREFIX = `${ROUTE_NAMESPACE}.`;
const TAB_PREFIX = `${TAB_NAMESPACE}.`;
const LOCALE_PREFIX = `${LOCALE_NAMESPACE}.`;
const MESSAGES_PREFIX = `${MESSAGES_NAMESPACE}.`;

/** Whether a binding path targets the writable variables store. */
const isVariablesKey = (key: string) =>
  key === VARIABLES_NAMESPACE || key.startsWith(NS_PREFIX);

/** Whether a binding path targets the API response state. */
const isApiKey = (key: string) =>
  key === API_NAMESPACE || key.startsWith(API_PREFIX);

/** Whether a binding path targets the screen's route params. */
const isRouteKey = (key: string) =>
  key === ROUTE_NAMESPACE || key.startsWith(ROUTE_PREFIX);

/** Whether a binding path targets the tab a designed tab bar repeats. */
const isTabKey = (key: string) =>
  key === TAB_NAMESPACE || key.startsWith(TAB_PREFIX);

/** Whether a binding path targets the active locale. */
const isLocaleKey = (key: string) =>
  key === LOCALE_NAMESPACE || key.startsWith(LOCALE_PREFIX);

/** Whether a binding path targets a translated message. */
const isMessageKey = (key: string) => key.startsWith(MESSAGES_PREFIX);

/**
 * Hook for accessing and retrieving values from the application state.
 *
 * This hook provides access to the state context and includes a getValue function
 * that can retrieve values from the state using various key formats and patterns.
 *
 * @returns An object containing the getValue function for state access
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { getValue } = useDataState();
 *
 *   // Get a simple value
 *   const userName = getValue({ key: 'user.name', active: true });
 *
 *   // Get multiple values joined with separator
 *   const fullName = getValue({ key: 'user.firstName;user.lastName;', active: true });
 *
 *   // Get the entire state object
 *   const entireState = getValue({ key: '(this)', active: true });
 *
 *   return <div>Hello, {userName}!</div>;
 * };
 * ```
 */
const useDataState = () => {
  const { value } = useContext(StateContext);
  const variablesState = useVariablesState();
  const variablesValue = variablesState?.value;
  const apiValue = useApiState();
  // Inside a screen its own params; above the navigator (where the action
  // handlers mount) the focused screen's.
  const screenParams = useRouteParams();
  const activeRoute = useActiveRoute();
  const routeValue = screenParams ?? activeRoute?.params ?? null;
  const tabValue = useTabScope();
  const localeState = useLocaleState();
  const localeValue = localeState?.value;
  const activeLocale = localeValue?.current;
  const message = localeState?.message;

  /**
   * Resolve one key segment: `vars.*` keys route to the writable variables
   * store, `api.*` keys to the API response state, `route.*` keys to the
   * screen's params and `tab.*` keys to the tab a designed tab bar repeats
   * (parallel contexts that scope providers never shadow), `locale.*` keys
   * to the active locale; everything else reads the nearest `StateProvider`
   * as before. With no `VariablesProvider` / request runtime / routed screen
   * / tab scope / `LocaleProvider` mounted, those keys fall through to
   * `altValue`.
   */
  const resolveData = useCallback(
    (key: string, altValue?: unknown) => {
      if (isVariablesKey(key)) {
        if (key === VARIABLES_NAMESPACE) return variablesValue ?? altValue;
        return get(variablesValue, key.slice(NS_PREFIX.length), altValue);
      }
      if (isApiKey(key)) {
        if (key === API_NAMESPACE) return apiValue ?? altValue;
        return get(apiValue, key.slice(API_PREFIX.length), altValue);
      }
      if (isRouteKey(key)) {
        if (key === ROUTE_NAMESPACE) return routeValue ?? altValue;
        return get(routeValue, key.slice(ROUTE_PREFIX.length), altValue);
      }
      if (isTabKey(key)) {
        if (key === TAB_NAMESPACE) return tabValue ?? altValue;
        return get(tabValue, key.slice(TAB_PREFIX.length), altValue);
      }
      if (isLocaleKey(key)) {
        if (key === LOCALE_NAMESPACE) return localeValue ?? altValue;
        return get(localeValue, key.slice(LOCALE_PREFIX.length), altValue);
      }
      return get(value, key, altValue);
    },
    [value, variablesValue, apiValue, routeValue, tabValue, localeValue],
  );

  /**
   * {@link resolveData}, plus `t.*` keys: the message's template in the
   * active locale, formatted with its placeholders read as binding paths
   * (`{vars.name}`, `{api.cart.count, plural, …}`). An unknown key — or no
   * `LocaleProvider` — falls through to `altValue`, so the element shows
   * its literal text.
   */
  const resolveKey = useCallback(
    (key: string, altValue?: unknown) => {
      if (!isMessageKey(key)) return resolveData(key, altValue);
      const parts = message?.(key.slice(MESSAGES_PREFIX.length));
      if (!parts || !activeLocale) return altValue;
      return formatMessage(parts, activeLocale, (arg) => resolveData(arg));
    },
    [resolveData, message, activeLocale],
  );

  /**
   * Evaluates a condition string (`dataProp::condition::value`) against the
   * state. Reads keys directly — a condition's paths never join or read
   * `(this)` — so `getValue` can resolve condition-keyed bindings through it.
   */
  const evaluateCondition = useCallback(
    (conditionStr: string) => {
      if (!isCondition(conditionStr)) return false;

      const { dataProp, valueProp, condition, valueType } =
        parseCondition(conditionStr);

      const data = resolveKey(dataProp, '');

      let compared;
      if (typeof valueProp !== 'boolean' && valueType === 'dataProp') {
        compared = resolveKey(valueProp, '');
      } else if (valueType === 'boolean') {
        compared = toBool(valueProp);
      } else if (valueType === 'number') {
        compared = toNumber(valueProp);
      } else {
        compared = valueProp;
      }

      if (!conditionMap[condition as Conditions]) {
        return false;
      }

      return conditionMap[condition as Conditions](data, compared);
    },
    [resolveKey],
  );

  /**
   * Retrieves a value from the state using a DataProp configuration.
   *
   * Supports various key formats:
   * - Simple keys: 'user.name' - retrieves nested property
   * - Multiple keys with separator: 'key1;key2;separator' - joins multiple values
   * - Special key '(this)': returns the entire state object
   * - Message keys: 't.home.title' - the translated message
   * - With `format`: the value written for the active locale
   *
   * @param dataProp - The data property configuration
   * @param dataProp.key - The key path(s) to retrieve from state
   * @param dataProp.active - Whether the data prop is active (inactive props return undefined)
   * @param altValue - Alternative value to return if the key is not found (default: 'N/A')
   * @returns The retrieved value, undefined if inactive, or altValue if not found
   *
   * @example
   * ```tsx
   * // Simple property access
   * const name = getValue({ key: 'user.name', active: true });
   *
   * // Multiple values with custom separator
   * const address = getValue({ key: 'user.street;user.city;user.state; ', active: true });
   *
   * // With custom fallback
   * const age = getValue({ key: 'user.age', active: true }, 'Unknown');
   * ```
   */
  const getValue = useCallback(
    ({ key, active, format }: DataProp, altValue: unknown = 'N/A') => {
      if (!active) {
        return;
      }

      // A formatted binding shows its value the way the active locale writes
      // numbers, money and dates; an unset value keeps its fallback.
      if (format) {
        const raw = resolveKey(key);
        if (raw === undefined || raw === null) return altValue;
        return formatValue(raw, parseValueFormat(format), activeLocale);
      }

      // A binding whose key is a condition (`props.isActive::eq::true`)
      // resolves to the condition's result — how `_visible` shows an element
      // only while a test holds.
      if (isCondition(key)) {
        return evaluateCondition(key);
      }

      const keys = parseJoin(key);

      if (keys && keys.length > 1) {
        const separator = keys.pop();

        return join(
          keys.map((k) => resolveKey(k, altValue)),
          separator,
        );
      }

      if (isDataThis(key)) {
        return value;
      }

      return resolveKey(key, altValue);
    },
    [value, resolveKey, evaluateCondition, activeLocale],
  );

  /**
   * Retrieves a raw string value from the state by key path.
   *
   * Convenience wrapper around `getValue` that always treats the prop as active
   * and falls back to an empty string instead of `'N/A'`.
   *
   * @param key - Dot-notation path into the state object (e.g. `'user.name'`)
   * @returns The resolved value as a string, or `''` if the key is not found
   */
  const getStateValue = useCallback(
    (key: string) => {
      return getValue({ key, active: true }, '');
    },
    [getValue],
  );

  /**
   * Evaluates a condition string against the current state and returns the boolean result.
   *
   * The condition string must be in the format recognised by `isCondition` / `parseCondition`
   * from `@mapples/inlang` (e.g. `'user.age > 18'`). If the string is not a valid condition
   * expression, `false` is returned without throwing.
   *
   * @param conditionStr - The condition expression to evaluate
   * @returns `true` when the condition is satisfied, `false` otherwise
   */
  const getConditionResult = evaluateCondition;

  return {
    getValue,
    getStateValue,
    getConditionResult,
  };
};

export default useDataState;
