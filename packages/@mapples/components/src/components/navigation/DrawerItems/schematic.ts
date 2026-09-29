import { RegisteredComponent } from '@mapples/types';

import DrawerItems from './index';

/** Registers {@link DrawerItems} under the `'DrawerItems'` type key. */
export const DrawerItemsSchematic: RegisteredComponent = {
  type: 'DrawerItems',
  Component: DrawerItems,
};
