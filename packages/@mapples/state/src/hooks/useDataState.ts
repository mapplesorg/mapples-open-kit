import { useContext } from 'react';

import { DataProp } from '@mapples/render';
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
 *   const fullName = getValue({ key: 'user.firstName;user.lastName; ', active: true });
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
  const getValue = ({ key, active }: DataProp, altValue = 'N/A') => {
    const keys = key?.replace(/\n/g, '').split(';');

    if (!active) {
      return;
    }

    if (keys?.length > 1) {
      const separator = keys.pop();

      return join(
        keys.map((k) => get(value, k, altValue)),
        separator,
      );
    }

    if (key === '(this)') {
      return value;
    }

    return get(value, key, altValue);
  };

  return {
    getValue,
  };
};

export default useDataState;
