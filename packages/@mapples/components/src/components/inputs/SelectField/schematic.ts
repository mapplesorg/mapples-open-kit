import { RegisteredComponent } from '@mapples/types';

import SelectField from './index';

/** Registers {@link SelectField} under the `'SelectField'` type key. */
export const SelectFieldSchematic: RegisteredComponent = {
  type: 'SelectField',
  Component: SelectField,
};
