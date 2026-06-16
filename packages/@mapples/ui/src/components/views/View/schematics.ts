import { RegisteredComponent } from '@mapples/types';

import View from './View';

/**
 * Schematic configuration for the View component.
 *
 * @public
 */
export const ViewSchematic: RegisteredComponent = {
  type: 'View',
  Component: View,
};

/**
 * Schematic configuration for the Container component.
 *
 * An alias of `ViewSchematic` registered under the `'Container'` type for use
 * as a generic layout container in the visual editor.
 *
 * @public
 */
export const ContainerSchematic: RegisteredComponent = {
  ...ViewSchematic,
  type: 'Container',
};
