import { RegisteredComponent } from '@mapples/types';

import PinInput from './index';

/** Registers {@link PinInput} under the `'PinInput'` type key. */
export const PinInputSchematic: RegisteredComponent = {
  type: 'PinInput',
  Component: PinInput,
};
