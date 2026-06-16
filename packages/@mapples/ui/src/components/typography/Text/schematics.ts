import { RegisteredComponent } from '@mapples/types';

import Text from './Text';

/**
 * Schematic registration entry for the {@link Text} component.
 *
 * Used by the Mapples renderer to resolve the `'Text'` component type at
 * runtime.
 *
 * @public
 */
export const TextSchematic: RegisteredComponent = {
  type: 'Text',
  Component: Text,
};
