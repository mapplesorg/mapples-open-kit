import useFormContext from './useFormContext';

/**
 * Hook to access form submission state and submit function.
 * This hook provides the current submission state and the submit function.
 * 
 * @returns Object containing submission state and submit function
 * 
 * @example
 * ```tsx
 * const SubmitButton = () => {
 *   const { submitting, submitForm } = useFormSubmit();
 *   
 *   return (
 *     <button onClick={submitForm} disabled={submitting}>
 *       {submitting ? 'Submitting...' : 'Submit'}
 *     </button>
 *   );
 * };
 * ```
 * 
 * @public
 */
const useFormSubmit = () => {
  const { submitting, submitForm } = useFormContext();

  return {
    submitting,
    submitForm,
  };
};

export default useFormSubmit;
