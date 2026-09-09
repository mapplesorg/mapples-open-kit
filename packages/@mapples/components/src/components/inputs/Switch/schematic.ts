import { RegisteredComponent } from '@mapples/types';

import Switch from './index';

/** Registers {@link Switch} under the `'Switch'` type key. */
export const SwitchSchematic: RegisteredComponent = {
  type: 'Switch',
  Component: Switch,
};
