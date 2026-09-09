import { RegisteredComponent } from '@mapples/types';

import MediaCard from './index';

/** Registers {@link MediaCard} under the `'MediaCard'` type key. */
export const MediaCardSchematic: RegisteredComponent = {
  type: 'MediaCard',
  Component: MediaCard,
};
