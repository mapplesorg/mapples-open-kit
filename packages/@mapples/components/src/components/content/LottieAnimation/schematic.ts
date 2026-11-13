import { RegisteredComponent } from '@mapples/types';

import LottieAnimation from './index';

/** Registers {@link LottieAnimation} under the `'LottieAnimation'` type key. */
export const LottieAnimationSchematic: RegisteredComponent = {
  type: 'LottieAnimation',
  Component: LottieAnimation,
};
