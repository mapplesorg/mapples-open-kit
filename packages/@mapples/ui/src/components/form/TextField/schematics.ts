import { RegisteredComponent } from '@mapples/types';

import TextField from './TextField';

/**
 * Schematic registration entry for the {@link TextField} component.
 *
 * Registers TextField under the `"TextField"` type key so that visual editors
 * and the schematic system can identify and render it.
 *
 * @public
 */
export const TextFieldSchematics: RegisteredComponent = {
  type: 'TextField',
  Component: TextField,
};
