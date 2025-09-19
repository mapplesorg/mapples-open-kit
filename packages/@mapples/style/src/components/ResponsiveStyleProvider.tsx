import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';

import { find, keys } from 'lodash';
import { useWindowDimensions } from 'react-native';

import { useStyle } from '@mapples/style';

import { ResponsiveContextProvider } from '../context';
import { BreakpointConfig } from '../types';

const isBetween = (value: number, { min, max }: BreakpointConfig) => {
  return value >= min && value <= max;
};

const ResponsiveStyleProvider: FC<PropsWithChildren> = ({ children }) => {
  const { responsiveConfig } = useStyle();

  const [currentBreakpoint, setCurrentBreakpoint] = useState(
    responsiveConfig.default,
  );

  const { width } = useWindowDimensions();

  const getCurrentBreakpoint = useCallback(
    (windowWidth: number) => {
      return find(keys(responsiveConfig.breakpoints), (breakpoint) => {
        return isBetween(windowWidth, responsiveConfig.breakpoints[breakpoint]);
      });
    },
    [responsiveConfig.breakpoints],
  );

  useEffect(() => {
    setCurrentBreakpoint(
      getCurrentBreakpoint(width) || responsiveConfig.default,
    );
  }, [getCurrentBreakpoint, responsiveConfig.default, width]);

  return (
    <ResponsiveContextProvider
      value={{
        windowWidth: width,
        currentBreakpoint: currentBreakpoint,
        setBreakpoint: setCurrentBreakpoint,
        ...responsiveConfig,
      }}
    >
      {children}
    </ResponsiveContextProvider>
  );
};

export default ResponsiveStyleProvider;
