import { createContext } from 'react';

import { noop } from 'lodash';

import { DefaultResponsiveConfig } from '../constants';
import { ResponsiveContextType } from '../types';

/**
 * React context that holds the current responsive state, including the active breakpoint
 * and window dimensions. Consumed via `useResponsive`.
 */
const ResponsiveContext = createContext<ResponsiveContextType>({
  windowWidth: 0,
  currentBreakpoint: 'mobile',
  setBreakpoint: noop,
  ...DefaultResponsiveConfig,
});

/** Context provider for `ResponsiveContext`. Used internally by `ResponsiveStyleProvider`. */
export const ResponsiveContextProvider = ResponsiveContext.Provider;

export default ResponsiveContext;
