import { RegisteredComponent } from '@mapples/types';

import InputField from './index';

/** Registers {@link InputField} under the `'InputField'` type key. */
export const InputFieldSchematic: RegisteredComponent = {
  type: 'InputField',
  Component: InputField,
};
