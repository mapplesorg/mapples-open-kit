import { RegisteredComponent } from '@mapples/types';

import CountdownTimer from './index';

/** Registers {@link CountdownTimer} under the `'CountdownTimer'` type key. */
export const CountdownTimerSchematic: RegisteredComponent = {
  type: 'CountdownTimer',
  Component: CountdownTimer,
};
