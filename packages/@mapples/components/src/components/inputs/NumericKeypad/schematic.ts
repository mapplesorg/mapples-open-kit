import { RegisteredComponent } from '@mapples/types';

import NumericKeypad from './index';

/** Registers {@link NumericKeypad} under the `'NumericKeypad'` type key. */
export const NumericKeypadSchematic: RegisteredComponent = {
  type: 'NumericKeypad',
  Component: NumericKeypad,
};
