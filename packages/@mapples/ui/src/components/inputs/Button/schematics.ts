import { RegisteredComponent } from '@mapples/types';

import Button from './Button';

/**
 * Schematic configuration for the Button component.
 *
 * This configuration defines how the Button component appears in visual editors,
 * including its properties, styling options, and default values.
 *
 * @public
 */
export const ButtonSchematic: RegisteredComponent = {
  type: 'Button',
  Component: Button,
};
