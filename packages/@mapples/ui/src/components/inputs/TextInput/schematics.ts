import { RegisteredComponent } from '@mapples/types';

import TextInput from './TextInput';

/**
 * Schematic configuration for the TextInput component.
 *
 * This configuration defines how the TextInput component appears in visual editors,
 * including its properties, styling options, and default values.
 *
 * @public
 */
export const TextInputSchematic: RegisteredComponent = {
  type: 'TextInput',
  Component: TextInput,
};
