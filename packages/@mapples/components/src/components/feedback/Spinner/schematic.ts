import { RegisteredComponent } from '@mapples/types';

import Spinner from './index';

/** Registers {@link Spinner} under the `'Spinner'` type key. */
export const SpinnerSchematic: RegisteredComponent = {
  type: 'Spinner',
  Component: Spinner,
};
