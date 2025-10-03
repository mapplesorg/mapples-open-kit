import { mapValues } from 'lodash';

import { RefPropsMap } from '../types';

import useRender from './useRender';

const useRefProps = (refProps?: RefPropsMap) => {
  const { assets } = useRender();

  return mapValues(refProps, (value) => {
    if (!value) return;

    return assets[value];
  });
};

export default useRefProps;
