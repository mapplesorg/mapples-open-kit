import { RegisteredComponent } from '@mapples/types';

import Steps from './index';

/** Registers {@link Steps} under the `'Steps'` type key. */
export const StepsSchematic: RegisteredComponent = {
  type: 'Steps',
  Component: Steps,
};
