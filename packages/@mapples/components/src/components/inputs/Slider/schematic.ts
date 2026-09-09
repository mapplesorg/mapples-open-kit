import { RegisteredComponent } from '@mapples/types';

import Slider from './index';

/** Registers {@link Slider} under the `'Slider'` type key. */
export const SliderSchematic: RegisteredComponent = {
  type: 'Slider',
  Component: Slider,
};
