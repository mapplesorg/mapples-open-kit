import { useMemo } from 'react';

import { isArray, mapValues, replace } from 'lodash';

import { getThemeRegexp, isCalc, isMultiply } from '../utils';

import useResponsive from './useResponsive';
import useSizing from './useSizing';
import useTheme from './useTheme';

const useStyled = <T extends object>(styled?: T) => {
  const { theme, getColor } = useTheme();
  const { sizing, getSize } = useSizing();
  const { getResponsiveStyle } = useResponsive();

  return useMemo(() => {
    if (!styled) {
      return {};
    }

    const stringifyProps = JSON.stringify(styled);
    const pattern = getThemeRegexp({ theme, sizing });

    const replaced = replace(stringifyProps, pattern, (value) => {
      const normalizedValue = replace(value, /"/gi, '');

      if (normalizedValue?.startsWith('theme'))
        return getColor(normalizedValue) || value;

      if (
        normalizedValue?.startsWith('sizing') ||
        isMultiply(normalizedValue) ||
        isCalc(normalizedValue)
      )
        return getSize(normalizedValue)?.toString() || value;

      return value;
    });

    const result = (JSON.parse(replaced) ?? {}) as T | T[];

    if (isArray(result)) {
      return result.map((item) => mapValues(item, getResponsiveStyle));
    }

    return mapValues(result, getResponsiveStyle);
  }, [getColor, getResponsiveStyle, getSize, sizing, styled, theme]);
};

export default useStyled;
