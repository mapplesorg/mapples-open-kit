import { RegisteredComponent } from '@mapples/types';

import SegmentedControl from './index';

/** Registers {@link SegmentedControl} under the `'SegmentedControl'` type key. */
export const SegmentedControlSchematic: RegisteredComponent = {
  type: 'SegmentedControl',
  Component: SegmentedControl,
};
