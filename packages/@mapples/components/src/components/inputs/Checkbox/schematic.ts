import { RegisteredComponent } from '@mapples/types';

import Checkbox from './index';

/** Registers {@link Checkbox} under the `'Checkbox'` type key. */
export const CheckboxSchematic: RegisteredComponent = {
  type: 'Checkbox',
  Component: Checkbox,
};
