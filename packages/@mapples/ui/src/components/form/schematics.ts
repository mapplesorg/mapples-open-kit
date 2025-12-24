import { RegisteredComponents } from '@mapples/types';

import { FormViewSchematic } from './FormView';
import { SubmitButtonSchematic } from './SubmitButton';
import { TextFieldSchematics } from './TextField';

export const FormSchematics: RegisteredComponents = {
  [FormViewSchematic.type]: FormViewSchematic,
  [TextFieldSchematics.type]: TextFieldSchematics,
  [SubmitButtonSchematic.type]: SubmitButtonSchematic,
};
