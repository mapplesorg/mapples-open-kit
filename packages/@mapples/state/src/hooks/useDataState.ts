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
import { DataProp } from '@mapples/types';
import { get, join } from 'lodash';

import StateContext from '../context';

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
    ({ key, active }: DataProp, altValue = 'N/A') => {
      const keys = parseJoin(key);

      if (!active) {
        return;
      }

      if (keys && keys.length > 1) {
        const separator = keys.pop();

        return join(
          keys.map((k) => get(value, k, altValue)),
          separator,
        );
      }

      if (isDataThis(key)) {
        return value;
      }

      return get(value, key, altValue);
    },
    [value],
  );

  const getStateValue = useCallback(
    (key: string) => {
      return getValue({ key, active: true }, '');
    },
    [getValue],
  );

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
