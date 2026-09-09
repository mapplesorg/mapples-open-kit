import { RegisteredComponent } from '@mapples/types';

import Rating from './index';

/** Registers {@link Rating} under the `'Rating'` type key. */
export const RatingSchematic: RegisteredComponent = {
  type: 'Rating',
  Component: Rating,
};
