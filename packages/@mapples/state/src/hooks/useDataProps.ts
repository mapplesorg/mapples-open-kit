import { useMemo } from 'react';

import { DataProps } from '@mapples/types';
import { isNil, mapValues, omitBy } from 'lodash';

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
    // A bound-but-unset variable resolves to nothing (the prop falls back to
    // the component default) rather than the text sentinel — a boolean prop
    // would otherwise read a truthy string and a Switch would render ON.
    const values = mapValues(data, (dataProp) =>
      dataProp ? getValue(dataProp, null) : undefined,
    );
    return omitBy(values, isNil);
  }, [data, getValue]);
};

export default useDataProps;
