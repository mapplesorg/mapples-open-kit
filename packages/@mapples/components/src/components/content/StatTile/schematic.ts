import { RegisteredComponent } from '@mapples/types';

import StatTile from './index';

/** Registers {@link StatTile} under the `'StatTile'` type key. */
export const StatTileSchematic: RegisteredComponent = {
  type: 'StatTile',
  Component: StatTile,
};
