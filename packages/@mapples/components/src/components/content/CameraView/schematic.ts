import { RegisteredComponent } from '@mapples/types';

import CameraView from './index';

/** Registers {@link CameraView} under the `'CameraView'` type key. */
export const CameraViewSchematic: RegisteredComponent = {
  type: 'CameraView',
  Component: CameraView,
};
