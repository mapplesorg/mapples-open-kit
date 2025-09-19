import { useMemo } from 'react';

import { DataProps } from '@mapples/render';
import { isUndefined, mapValues, omitBy } from 'lodash';

import useDataState from './useDataState';

const useDataProps = (data?: DataProps) => {
  const { getValue } = useDataState();

  return useMemo(() => {
    const values = mapValues(data, getValue);
    return omitBy(values, isUndefined);
  }, [data, getValue]);
};

export default useDataProps;
