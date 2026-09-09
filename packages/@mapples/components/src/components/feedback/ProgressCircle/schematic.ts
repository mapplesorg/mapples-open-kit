import { RegisteredComponent } from '@mapples/types';

import ProgressCircle from './index';

/** Registers {@link ProgressCircle} under the `'ProgressCircle'` type key. */
export const ProgressCircleSchematic: RegisteredComponent = {
  type: 'ProgressCircle',
  Component: ProgressCircle,
};
