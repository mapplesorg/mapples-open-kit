import { RegisteredComponent } from '@mapples/types';

import Card from './index';

/** Registers {@link Card} under the `'Card'` type key. */
export const CardSchematic: RegisteredComponent = {
  type: 'Card',
  Component: Card,
};
