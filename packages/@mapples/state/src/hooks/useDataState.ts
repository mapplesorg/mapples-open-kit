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
import { DataProp, VARIABLES_NAMESPACE } from '@mapples/types';
import { get, join } from 'lodash';

import StateContext from '../context';
import { useVariablesState } from '../writable/context';

const NS_PREFIX = `${VARIABLES_NAMESPACE}.`;

/** Whether a binding path targets the writable variables store. */
const isVariablesKey = (key: string) =>
  key === VARIABLES_NAMESPACE || key.startsWith(NS_PREFIX);

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

  /**
   * Resolve one key segment: `vars.*` keys route to the writable variables
   * store (a parallel context that scope providers never shadow); everything
   * else reads the nearest `StateProvider` as before. With no
   * `VariablesProvider` mounted, `vars.*` falls through to `altValue`.
   */
  const resolveKey = useCallback(
    (key: string, altValue?: unknown) => {
      if (isVariablesKey(key)) {
        if (key === VARIABLES_NAMESPACE) return variablesValue ?? altValue;
        return get(variablesValue, key.slice(NS_PREFIX.length), altValue);
      }
      return get(value, key, altValue);
    },
    [value, variablesValue],
  );

  /**
   * Retrieves a value from the state using a DataProp configuration.
   *
   * Supports various key formats:
   * - Simple keys: 'user.name' - retrieves nested property
   * - Multiple keys with separator: 'key1;key2;separator' - joins multiple values
   * - Special key '(this)': returns the entire state object
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
    ({ key, active }: DataProp, altValue: unknown = 'N/A') => {
      const keys = parseJoin(key);

      if (!active) {
        return;
      }

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
    [value, resolveKey],
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
  const getConditionResult = useCallback(
    (conditionStr: string) => {
      if (!isCondition(conditionStr)) return false;

      const { dataProp, valueProp, condition, valueType } =
        parseCondition(conditionStr);

      const data = getStateValue(dataProp);

      let value;
      if (typeof valueProp !== 'boolean' && valueType === 'dataProp') {
        value = getStateValue(valueProp);
      } else if (valueType === 'boolean') {
        value = toBool(valueProp);
      } else if (valueType === 'number') {
        value = toNumber(valueProp);
      } else {
        value = valueProp;
      }

      if (!conditionMap[condition as Conditions]) {
        return false;
      }

      return conditionMap[condition as Conditions](data, value);
    },
    [getStateValue],
  );

  return {
    getValue,
    getStateValue,
    getConditionResult,
  };
};

export default useDataState;
