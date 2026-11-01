import { RegisteredComponent } from '@mapples/types';

import TabBarItems from './index';

/** Registers {@link TabBarItems} under the `'TabBarItems'` type key. */
export const TabBarItemsSchematic: RegisteredComponent = {
  type: 'TabBarItems',
  Component: TabBarItems,
};
