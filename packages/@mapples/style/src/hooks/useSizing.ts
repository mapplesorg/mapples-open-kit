import { useCallback } from 'react';

import { get, replace } from 'lodash';
import { DimensionValue } from 'react-native';

import { isCalc, isMultiply, parseCalc } from '../utils';

import useStyle from './useStyle';

/**
 * Hook to access and manage sizing configuration with support for calculations and multipliers.
 *
 * @returns Object containing sizing utilities
 *
 * @returns sizing - The complete sizing configuration object
 * @returns getSize - Function to resolve size values from sizing paths or calculations
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { getSize } = useSizing();
 *
 *   return (
 *     <View style={{
 *       width: getSize('sm'),
 *       height: getSize('2*'), // 2 times base size
 *       padding: getSize('calc(100% - 20px)')
 *     }}>
 *       <Text>Sized content</Text>
 *     </View>
 *   );
 * };
 * ```
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { sizing, getSize } = useSizing();
 *
 *   return (
 *     <View style={{
 *       margin: getSize('md'),
 *       borderRadius: getSize('lg'),
 *       minHeight: getSize('3*') // 3 times base size
 *     }}>
 *       <Text>Multiple sizes</Text>
 *     </View>
 *   );
 * };
 * ```
 */
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
