import { RegisteredComponent } from '@mapples/types';

import SubmitButton from './SubmitButton';

/**
 * Schematic configuration for the Button component.
 *
 * This configuration defines how the Button component appears in visual editors,
 * including its properties, styling options, and default values.
 *
 * @public
 */
export const SubmitButtonSchematic: RegisteredComponent = {
  type: 'SubmitButton',
  Component: SubmitButton,
};
