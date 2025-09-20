import { createContext } from 'react';

import { noop } from 'lodash';

import type { FormContextType } from '../types';

/**
 * React Context for form state management.
 * This context provides form state, validation errors, submission state,
 * and form control methods to child components.
 *
 * @public
 */
const FormContext = createContext<FormContextType<object>>({
  form: null,
  validationErrors: null,
  submitting: true,
  submitForm: noop,
  validate: noop,
  touch: noop,
  touched: {},
});

/**
 * Provider component for the FormContext.
 * This component should be used by the Form component to provide
 * form state to its children.
 *
 * @public
 */
export const FormContextProvider = FormContext.Provider;

export default FormContext;
