import { RegisteredComponent } from '@mapples/types';

import Banner from './index';

/** Registers {@link Banner} under the `'Banner'` type key. */
export const BannerSchematic: RegisteredComponent = {
  type: 'Banner',
  Component: Banner,
};
