import { RegisteredComponent } from '@mapples/types';

import PageControl from './index';

/** Registers {@link PageControl} under the `'PageControl'` type key. */
export const PageControlSchematic: RegisteredComponent = {
  type: 'PageControl',
  Component: PageControl,
};
