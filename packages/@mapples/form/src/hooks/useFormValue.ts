import { useContext, useEffect, useState } from 'react';

import FormContext from '../context';

/**
 * Hook to get a reactive value from the form state.
 * This hook subscribes to value changes and returns the current value.
 *
 * @template T - The type of the value to retrieve
 * @param fieldPath - Optional dot notation path to the field. If not provided, returns all form values
 * @returns The current value at the specified path or all form values
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const userName = useFormValue<string>('user.name');
 *   const allValues = useFormValue<UserForm>();
 *
 *   return (
 *     <div>
 *       <p>User name: {userName}</p>
 *       <p>All values: {JSON.stringify(allValues)}</p>
 *     </div>
 *   );
 * };
 * ```
 *
 * @public
 */
const useFormValue = <T>(fieldPath?: string) => {
  const { form } = useContext(FormContext);

  const [value, setValue] = useState<T>();

  useEffect(() => {
    setValue(form?.getValue(fieldPath));
  }, [fieldPath, form]);

  useEffect(() => {
    const unsubscribe = form?.subscribeOnChange<T>((formValue) => {
      setValue(formValue);
    }, fieldPath);

    return () => {
      unsubscribe?.();
    };
  }, [fieldPath, form]);

  return value;
};

export default useFormValue;
