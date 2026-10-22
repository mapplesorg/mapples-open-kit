import { RegisteredComponent } from '@mapples/types';

import ActivityRings from './index';

/** Registers {@link ActivityRings} under the `'ActivityRings'` type key. */
export const ActivityRingsSchematic: RegisteredComponent = {
  type: 'ActivityRings',
  Component: ActivityRings,
};
