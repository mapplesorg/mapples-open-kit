import { RegisteredComponent } from '@mapples/types';

import WaveformSeekBar from './index';

/** Registers {@link WaveformSeekBar} under the `'WaveformSeekBar'` type key. */
export const WaveformSeekBarSchematic: RegisteredComponent = {
  type: 'WaveformSeekBar',
  Component: WaveformSeekBar,
};
