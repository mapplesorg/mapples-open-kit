import { RegisteredComponent } from '@mapples/types';

import Pressable from './Pressable';

/**
 * Schematic configuration for the Pressable component.
 *
 * This configuration defines how the Pressable component appears in visual editors,
 * including its properties, styling options, and default values.
 *
 * @public
 */
export const PressableSchematics: RegisteredComponent = {
  type: 'Pressable',
  Component: Pressable,
};
