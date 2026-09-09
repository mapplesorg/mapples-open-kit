import { RegisteredComponent } from '@mapples/types';

import ButtonGroup from './index';

/** Registers {@link ButtonGroup} under the `'ButtonGroup'` type key. */
export const ButtonGroupSchematic: RegisteredComponent = {
  type: 'ButtonGroup',
  Component: ButtonGroup,
};
