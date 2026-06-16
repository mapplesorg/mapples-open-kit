import { RegisteredComponent } from '@mapples/types';

import Select from './Select';

/**
 * Schematic configuration for the Select component.
 *
 * This configuration defines how the Select component appears in visual editors,
 * including its properties, styling options, and default values.
 *
 * @public
 */
export const SelectSchematics: RegisteredComponent = {
  type: 'Select',
  Component: Select,
};
