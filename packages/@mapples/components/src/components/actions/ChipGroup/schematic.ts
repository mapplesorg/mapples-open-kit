import { RegisteredComponent } from '@mapples/types';

import ChipGroup from './index';

/** Registers {@link ChipGroup} under the `'ChipGroup'` type key. */
export const ChipGroupSchematic: RegisteredComponent = {
  type: 'ChipGroup',
  Component: ChipGroup,
};
