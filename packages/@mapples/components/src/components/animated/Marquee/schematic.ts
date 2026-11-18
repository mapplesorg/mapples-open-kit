import { RegisteredComponent } from '@mapples/types';

import Marquee from './index';

/** Registers {@link Marquee} under the `'Marquee'` type key. */
export const MarqueeSchematic: RegisteredComponent = {
  type: 'Marquee',
  Component: Marquee,
};
