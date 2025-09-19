import { useContext } from 'react';

import FormContext from '../context';

/**
 * Hook to access the form context containing form state and methods.
 * This hook provides access to the FormState instance, validation errors,
 * submission state, and form control methods.
 *
 * @returns Form context object with form state and methods
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { form, submitting, submitForm, validationErrors } = useFormContext();
 *
 *   return (
 *     <div>
 *       <button onClick={submitForm} disabled={submitting}>
 *         {submitting ? 'Submitting...' : 'Submit'}
 *       </button>
 *       {validationErrors && <div>Validation errors occurred</div>}
 *     </div>
 *   );
 * };
 * ```
 *
 * @public
 */
const useFormContext = () => {
  return useContext(FormContext);
};

export default useFormContext;
