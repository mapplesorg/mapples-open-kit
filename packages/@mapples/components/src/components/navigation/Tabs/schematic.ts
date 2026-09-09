import { RegisteredComponent } from '@mapples/types';

import Tabs from './index';

/** Registers {@link Tabs} under the `'Tabs'` type key. */
export const TabsSchematic: RegisteredComponent = {
  type: 'Tabs',
  Component: Tabs,
};
