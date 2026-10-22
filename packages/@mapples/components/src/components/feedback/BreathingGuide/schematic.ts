import { RegisteredComponent } from '@mapples/types';

import BreathingGuide from './index';

/** Registers {@link BreathingGuide} under the `'BreathingGuide'` type key. */
export const BreathingGuideSchematic: RegisteredComponent = {
  type: 'BreathingGuide',
  Component: BreathingGuide,
};
