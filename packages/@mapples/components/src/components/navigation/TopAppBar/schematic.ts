import { RegisteredComponent } from '@mapples/types';

import TopAppBar from './index';

/** Registers {@link TopAppBar} under the `'TopAppBar'` type key. */
export const TopAppBarSchematic: RegisteredComponent = {
  type: 'TopAppBar',
  Component: TopAppBar,
};
