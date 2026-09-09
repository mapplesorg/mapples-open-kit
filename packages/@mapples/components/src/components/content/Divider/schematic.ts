import { RegisteredComponent } from '@mapples/types';

import Divider from './index';

/** Registers {@link Divider} under the `'Divider'` type key. */
export const DividerSchematic: RegisteredComponent = {
  type: 'Divider',
  Component: Divider,
};
