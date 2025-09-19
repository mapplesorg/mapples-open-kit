import { useContext } from 'react';

import { DataProp } from '@mapples/render';
import { get, join } from 'lodash';

import StateContext from '../context';

const useDataState = () => {
  const { value } = useContext(StateContext);

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
