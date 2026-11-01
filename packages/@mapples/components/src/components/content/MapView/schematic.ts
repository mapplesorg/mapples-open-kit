import { RegisteredComponent } from '@mapples/types';

import MapView from './index';

/** Registers {@link MapView} under the `'MapView'` type key. */
export const MapViewSchematic: RegisteredComponent = {
  type: 'MapView',
  Component: MapView,
};
