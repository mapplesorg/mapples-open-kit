import useForm from './useForm';

/**
 * Hook to access form submission state and submit function.
 * This hook provides the current submission state and the submit function.
 *
 * @returns Object containing submission state and submit function
 *
 * @example
 * ```tsx
 * const SubmitButton = () => {
 *   const { submitting, submitForm, isValid } = useFormSubmit();
 *
 *   return (
 *     <button onClick={submitForm} disabled={submitting || !isValid}>
 *       {submitting ? 'Submitting...' : 'Submit'}
 *     </button>
 *   );
 * };
 * ```
 *
 * @public
 */
const useFormSubmit = () => {
  const { submitting, submitForm, validationErrors } = useForm();

  return {
    submitting,
    submitForm,
    isValid: !validationErrors,
  };
};

export default useFormSubmit;
