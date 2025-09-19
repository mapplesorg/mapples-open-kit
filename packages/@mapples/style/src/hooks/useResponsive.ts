import { useContext, useMemo } from 'react';

import { cloneDeep, isArray, keys, map } from 'lodash';

import { ResponsiveContext } from '../context';

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
