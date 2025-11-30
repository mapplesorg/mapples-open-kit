import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';

import { find, keys } from 'lodash';
import { useWindowDimensions } from 'react-native';

import { ResponsiveContextProvider } from '../context';
import { useStyle } from '../hooks';
import { BreakpointConfig } from '../types';

/**
 * Checks if a value is between the min and max values of a breakpoint configuration.
 *
 * @param value - The value to check
 * @param config - The breakpoint configuration with min and max values
 * @returns True if the value is within the breakpoint range
 */
const isBetween = (value: number, { min, max }: BreakpointConfig) => {
  return value >= min && value <= max;
};

/**
 * Provider component that manages responsive breakpoint detection and provides responsive context.
 * This component automatically detects the current breakpoint based on window dimensions
 * and provides responsive utilities to child components.
 *
 * @param props - The component props
 * @param props.children - Child components to be wrapped with responsive context
 *
 * @example
 * ```tsx
 * import { ResponsiveStyleProvider } from '@mapples/style';
 *
 * const App = () => {
 *   return (
 *     <ResponsiveStyleProvider>
 *       <MyResponsiveApp />
 *     </ResponsiveStyleProvider>
 *   );
 * };
 * ```
 */
const ResponsiveStyleProvider: FC<PropsWithChildren> = ({ children }) => {
  const { responsiveConfig } = useStyle();

  const [currentBreakpoint, setCurrentBreakpoint] = useState(
    responsiveConfig.default,
  );

  const { width } = useWindowDimensions();

  const getCurrentBreakpoint = useCallback(
    (windowWidth: number) => {
      // Sort breakpoints by min value for efficient lookup
      const breakpointKeys = keys(responsiveConfig.breakpoints);
      const sortedBreakpoints = breakpointKeys.sort((a, b) => {
        return (
          responsiveConfig.breakpoints[a].min -
          responsiveConfig.breakpoints[b].min
        );
      });

      // Find the largest breakpoint that fits (check from largest to smallest)
      for (let i = sortedBreakpoints.length - 1; i >= 0; i--) {
        const breakpoint = sortedBreakpoints[i];
        if (isBetween(windowWidth, responsiveConfig.breakpoints[breakpoint])) {
          return breakpoint;
        }
      }

      return responsiveConfig.default;
    },
    [responsiveConfig.breakpoints, responsiveConfig.default],
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
