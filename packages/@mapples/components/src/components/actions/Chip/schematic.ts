import { RegisteredComponent } from '@mapples/types';

import Chip from './index';

/** Registers {@link Chip} under the `'Chip'` type key. */
export const ChipSchematic: RegisteredComponent = {
  type: 'Chip',
  Component: Chip,
};
