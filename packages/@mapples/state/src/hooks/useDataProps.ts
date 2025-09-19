import { useMemo } from 'react';

import { DataProps } from '@mapples/render';
import { isUndefined, mapValues, omitBy } from 'lodash';

import useDataState from './useDataState';

/**
 * Hook for processing multiple data properties and returning resolved values.
 * 
 * This hook takes a DataProps object and processes each property using the
 * getValue function from useDataState. It filters out undefined values and
 * returns a clean object with only the resolved, active data properties.
 * 
 * @param data - Optional object containing DataProp configurations
 * @returns A memoized object containing resolved values from the data props
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const dataProps = {
 *     name: { key: 'user.name', active: true },
 *     email: { key: 'user.email', active: true },
 *     age: { key: 'user.age', active: false }, // This will be filtered out
 *     address: { key: 'user.street;user.city; ', active: true }
 *   };
 * 
 *   const resolvedProps = useDataProps(dataProps);
 *   // Result: { name: 'John', email: 'john@example.com', address: '123 Main St New York' }
 * 
 *   return <div>{resolvedProps.name} - {resolvedProps.email}</div>;
 * };
 * ```
 */
const useDataProps = (data?: DataProps) => {
  const { getValue } = useDataState();

  return useMemo(() => {
    const values = mapValues(data, getValue);
    return omitBy(values, isUndefined);
  }, [data, getValue]);
};

export default useDataProps;
