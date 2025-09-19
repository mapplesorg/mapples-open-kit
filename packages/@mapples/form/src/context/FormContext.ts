import { createContext } from 'react';

import { noop } from 'lodash';

import type { FormContextType } from '../types';

const FormContext = createContext<FormContextType<object>>({
  form: null,
  validationErrors: null,
  submitting: true,
  submitForm: noop,
  validate: noop,
  touch: noop,
  touched: {},
});

export const FormContextProvider = FormContext.Provider;

export default FormContext;
