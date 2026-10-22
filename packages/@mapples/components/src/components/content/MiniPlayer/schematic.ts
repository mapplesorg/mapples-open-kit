import { RegisteredComponent } from '@mapples/types';

import MiniPlayer from './index';

/** Registers {@link MiniPlayer} under the `'MiniPlayer'` type key. */
export const MiniPlayerSchematic: RegisteredComponent = {
  type: 'MiniPlayer',
  Component: MiniPlayer,
};
