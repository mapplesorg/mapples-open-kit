import { RegisteredComponent } from '@mapples/types';

import IconComponent from './Icon';

/**
 * Schematic registration entry for the `Icon` component.
 *
 * Used by the `@mapples/render` pipeline to resolve the `"Icon"` element type
 * to the `Icon` React component at runtime.
 *
 * @public
 */
export const IconSchematics: RegisteredComponent = {
  type: 'Icon',
  Component: IconComponent,
};
