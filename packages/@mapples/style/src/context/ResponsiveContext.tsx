import { createContext } from 'react';

import { noop } from 'lodash';

import { DefaultResponsiveConfig } from '../constants';
import { ResponsiveContextType } from '../types';

const ResponsiveContext = createContext<ResponsiveContextType>({
  windowWidth: 0,
  currentBreakpoint: 'mobile',
  setBreakpoint: noop,
  ...DefaultResponsiveConfig,
});

export const ResponsiveContextProvider = ResponsiveContext.Provider;

export default ResponsiveContext;
