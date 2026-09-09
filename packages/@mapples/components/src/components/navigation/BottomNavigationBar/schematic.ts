import { RegisteredComponent } from '@mapples/types';

import BottomNavigationBar from './index';

/** Registers {@link BottomNavigationBar} under the `'BottomNavigationBar'` type key. */
export const BottomNavigationBarSchematic: RegisteredComponent = {
  type: 'BottomNavigationBar',
  Component: BottomNavigationBar,
};
