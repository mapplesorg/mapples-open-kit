import { RegisteredComponent } from '@mapples/types';

import Timeline from './index';

/** Registers {@link Timeline} under the `'Timeline'` type key. */
export const TimelineSchematic: RegisteredComponent = {
  type: 'Timeline',
  Component: Timeline,
};
