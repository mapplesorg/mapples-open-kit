import { useCallback } from 'react';

import { get, replace } from 'lodash';
import { DimensionValue } from 'react-native';

import { isCalc, isMultiply, parseCalc } from '../utils';

import useStyle from './useStyle';

const useSizing = () => {
  const { sizingConfig } = useStyle();

  const getSize = useCallback(
    (size: string): DimensionValue => {
      if (isMultiply(size)) {
        return sizingConfig.base * parseInt(replace(size, '*', ''), 10);
      }

      if (isCalc(size)) {
        return parseCalc(size, sizingConfig.base);
      }

      const sizeValue = get(sizingConfig, size);

      if (isMultiply(sizeValue)) {
        return sizingConfig.base * parseInt(replace(sizeValue, '*', ''), 10);
      }

      if (isCalc(sizeValue)) {
        return parseCalc(sizeValue, sizingConfig.base);
      }

      return sizeValue;
    },
    [sizingConfig],
  );

  return {
    sizing: sizingConfig.sizing,
    getSize,
  };
};

export default useSizing;
