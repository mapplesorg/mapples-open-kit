import { RegisteredComponent } from '@mapples/types';

import FlipCard from './index';

/** Registers {@link FlipCard} under the `'FlipCard'` type key. */
export const FlipCardSchematic: RegisteredComponent = {
  type: 'FlipCard',
  Component: FlipCard,
};
