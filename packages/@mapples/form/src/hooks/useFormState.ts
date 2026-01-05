import { useCallback, useContext, useEffect, useState } from 'react';

import FormContext from '../context';

/**
 * Hook to manage the entire form state with reactive values and control methods.
 * This hook provides access to all form values and methods to update them.
 *
 * @template T - The type of the form data object
 * @returns Object containing form values and control methods
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { values, setValues, getValues } = useFormState<UserForm>();
 *
 *   const handleReset = () => {
 *     setValues({ name: '', email: '' });
 *   };
 *
 *   return (
 *     <div>
 *       <p>Current values: {JSON.stringify(values)}</p>
 *       <button onClick={handleReset}>Reset Form</button>
 *     </div>
 *   );
 * };
 * ```
 *
 * @public
 */
const useFormState = <T extends object>() => {
  const [values, setFormValues] = useState<T>();

  const { form, initialized } = useContext(FormContext);

  useEffect(() => {
    if (initialized) {
      setFormValues(form?.getValues() as T);
    }

    const unsubscribe = form?.subscribeOnChange<T>((values) => {
      setFormValues(values);
    });
    return () => {
      unsubscribe?.();
    };
  }, [form, initialized]);

  const setValues = useCallback(
    (values: T) => {
      form?.setValues(values);
    },
    [form],
  );

  const getValues = useCallback(() => {
    return form?.getValues() as T | undefined;
  }, [form]);

  return {
    values,
    setValues,
    getValues,
  };
};

export default useFormState;
