import { RegisteredComponent } from '@mapples/types';

import RangeSlider from './index';

/** Registers {@link RangeSlider} under the `'RangeSlider'` type key. */
export const RangeSliderSchematic: RegisteredComponent = {
  type: 'RangeSlider',
  Component: RangeSlider,
};
