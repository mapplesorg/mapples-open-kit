import { RegisteredComponent } from '@mapples/types';

import Typography from './Typography';

/**
 * Schematic registration entry for the {@link Typography} component.
 *
 * Used by the Mapples renderer to resolve the `'Typography'` component type
 * at runtime.
 *
 * @public
 */
export const TypographyComponentSchematics: RegisteredComponent = {
  type: 'Typography',
  Component: Typography,
};
