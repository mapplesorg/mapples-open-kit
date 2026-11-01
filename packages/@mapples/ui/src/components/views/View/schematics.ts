import { RegisteredComponent } from '@mapples/types';

import Container from './Container';
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
 * Registered under the `'Container'` type for use as a generic layout
 * container in the visual editor.
 *
 * @public
 */
export const ContainerSchematic: RegisteredComponent = {
  type: 'Container',
  Component: Container,
};
