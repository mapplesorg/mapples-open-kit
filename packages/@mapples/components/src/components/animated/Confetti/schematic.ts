import { RegisteredComponent } from '@mapples/types';

import Confetti from './index';

/** Registers {@link Confetti} under the `'Confetti'` type key. */
export const ConfettiSchematic: RegisteredComponent = {
  type: 'Confetti',
  Component: Confetti,
};
