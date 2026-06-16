import { RegisteredComponent } from '@mapples/types';

import FormView from './FormView';

/**
 * Schematic registration entry for the {@link FormView} component.
 *
 * Registers FormView under the `"FormView"` type key so that visual editors
 * and the schematic system can identify and render it.
 *
 * @public
 */
export const FormViewSchematic: RegisteredComponent = {
  type: 'FormView',
  Component: FormView,
};
