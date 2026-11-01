import { RegisteredComponent } from '@mapples/types';

import MasonryGrid from './index';

/** Registers {@link MasonryGrid} under the `'MasonryGrid'` type key. */
export const MasonryGridSchematic: RegisteredComponent = {
  type: 'MasonryGrid',
  Component: MasonryGrid,
};
