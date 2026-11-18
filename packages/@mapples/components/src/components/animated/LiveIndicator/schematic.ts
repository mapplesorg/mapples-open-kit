import { RegisteredComponent } from '@mapples/types';

import LiveIndicator from './index';

/** Registers {@link LiveIndicator} under the `'LiveIndicator'` type key. */
export const LiveIndicatorSchematic: RegisteredComponent = {
  type: 'LiveIndicator',
  Component: LiveIndicator,
};
