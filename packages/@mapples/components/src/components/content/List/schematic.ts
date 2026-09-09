import { RegisteredComponent } from '@mapples/types';

import List from './index';

/** Registers {@link List} under the `'List'` type key. */
export const ListSchematic: RegisteredComponent = {
  type: 'List',
  Component: List,
};
