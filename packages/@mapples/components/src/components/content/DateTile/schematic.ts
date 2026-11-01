import { RegisteredComponent } from '@mapples/types';

import DateTile from './index';

/** Registers {@link DateTile} under the `'DateTile'` type key. */
export const DateTileSchematic: RegisteredComponent = {
  type: 'DateTile',
  Component: DateTile,
};
