import { useContext, useMemo } from 'react';

import { cloneDeep, isArray, keys, map } from 'lodash';

import { ResponsiveContext } from '../context';

/**
 * Parses responsive styles by applying the current breakpoint's styles to the base styles.
 * 
 * @param prop - The style object that may contain responsive variants
 * @param currentBreakpoint - The current active breakpoint
 * @param breakpointVariants - Array of available breakpoint variants
 * @returns The parsed style object with responsive styles applied
 * 
 * @example
 * ```tsx
 * const responsiveStyle = parseResponsiveStyle(
 *   {
 *     fontSize: 16,
 *     '&:tablet': { fontSize: 20 },
 *     '&:desktop': { fontSize: 24 }
 *   },
 *   'tablet',
 *   ['mobile', 'tablet', 'desktop']
 * );
 * // Result: { fontSize: 20 }
 * ```
 */
export const parseResponsiveStyle = <T>(
  prop: T,
  currentBreakpoint: string,
  breakpointVariants: string[],
): T => {
  if (typeof prop !== 'object') {
    return prop;
  }

  if (isArray(prop)) {
    return map(prop, parseResponsiveStyle) as T;
  }

  const objectHasBreakPoint = breakpointVariants.some((breakpoint) => {
    return prop?.[`&:${breakpoint}` as keyof typeof prop] !== undefined;
  });

  if (!objectHasBreakPoint) {
    return prop;
  }

  const propOriginal = cloneDeep(prop);
  for (const key in propOriginal) {
    if (key.startsWith('&')) {
      delete propOriginal?.[key];
    }
  }

  const breakPointStyle = prop?.[`&:${currentBreakpoint}` as keyof typeof prop];

  return {
    ...propOriginal,
    ...breakPointStyle,
  };
};

/**
 * Hook to access and manage responsive design utilities and breakpoint information.
 * 
 * @returns Object containing responsive utilities
 * 
 * @returns currentBreakpoint - The current active breakpoint name
 * @returns isBreakpoint - Function to check if current breakpoint matches a specific breakpoint
 * @returns isSmaller - Function to check if window width is smaller than a given value
 * @returns isLarger - Function to check if window width is larger than a given value
 * @returns getResponsiveStyle - Function to parse responsive styles for the current breakpoint
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { currentBreakpoint, isBreakpoint, getResponsiveStyle } = useResponsive();
 *   
 *   const responsiveStyle = getResponsiveStyle({
 *     fontSize: 16,
 *     '&:tablet': { fontSize: 20 },
 *     '&:desktop': { fontSize: 24 }
 *   });
 *   
 *   return (
 *     <Text style={responsiveStyle}>
 *       Current breakpoint: {currentBreakpoint}
 *     </Text>
 *   );
 * };
 * ```
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { isSmaller, isLarger, isBreakpoint } = useResponsive();
 *   
 *   return (
 *     <View>
 *       {isBreakpoint('mobile') && <Text>Mobile view</Text>}
 *       {isSmaller(768) && <Text>Small screen</Text>}
 *       {isLarger(1024) && <Text>Large screen</Text>}
 *     </View>
 *   );
 * };
 * ```
 */
const useResponsive = () => {
  const { currentBreakpoint, breakpoints, windowWidth } =
    useContext(ResponsiveContext);

  const breakpointVariants = useMemo(() => keys(breakpoints), [breakpoints]);

  const isBreakpoint = (breakpoint: string) => {
    return breakpoint === currentBreakpoint;
  };

  const isSmaller = (width: number) => {
    return windowWidth < width;
  };

  const isLarger = (width: number) => {
    return windowWidth > width;
  };

  const getResponsiveStyle = <T>(style: T) => {
    return parseResponsiveStyle(style, currentBreakpoint, breakpointVariants);
  };

  return {
    currentBreakpoint,
    isBreakpoint,
    isSmaller,
    isLarger,
    getResponsiveStyle,
  };
};

export default useResponsive;
