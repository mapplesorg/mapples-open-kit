import { RegisteredComponent } from '@mapples/types';

import ProgressBar from './index';

/** Registers {@link ProgressBar} under the `'ProgressBar'` type key. */
export const ProgressBarSchematic: RegisteredComponent = {
  type: 'ProgressBar',
  Component: ProgressBar,
};
