import { RegisteredComponent } from '@mapples/types';

import AnimatedNumber from './index';

/** Registers {@link AnimatedNumber} under the `'AnimatedNumber'` type key. */
export const AnimatedNumberSchematic: RegisteredComponent = {
  type: 'AnimatedNumber',
  Component: AnimatedNumber,
};
