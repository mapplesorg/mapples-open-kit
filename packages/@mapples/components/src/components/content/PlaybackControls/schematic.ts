import { RegisteredComponent } from '@mapples/types';

import PlaybackControls from './index';

/** Registers {@link PlaybackControls} under the `'PlaybackControls'` type key. */
export const PlaybackControlsSchematic: RegisteredComponent = {
  type: 'PlaybackControls',
  Component: PlaybackControls,
};
