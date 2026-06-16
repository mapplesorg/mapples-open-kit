import { RegisteredComponents } from '@mapples/types';

import { FormViewSchematic } from './FormView';
import { SubmitButtonSchematic } from './SubmitButton';
import { TextFieldSchematics } from './TextField';

/**
 * Combined schematic registry for all form components.
 *
 * Aggregates {@link FormViewSchematic}, {@link TextFieldSchematics}, and
 * {@link SubmitButtonSchematic} into a single `RegisteredComponents` map,
 * keyed by each component's `type` string.
 *
 * @public
 */
export const FormSchematics: RegisteredComponents = {
  [FormViewSchematic.type]: FormViewSchematic,
  [TextFieldSchematics.type]: TextFieldSchematics,
  [SubmitButtonSchematic.type]: SubmitButtonSchematic,
};
