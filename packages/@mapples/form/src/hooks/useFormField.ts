import { useCallback, useEffect, useState } from 'react';

import useFormHelper from './useFormHelper';

/**
 * Hook to manage a single form field with value, validation, and touch state.
 * This hook provides reactive access to a form field's value, errors, and touch state,
 * along with methods to update the value and trigger validation.
 *
 * @template T - The type of the field value
 * @param fieldPath - Dot notation path to the field (e.g., 'user.name')
 * @returns Object containing field value, error state, and control methods
 *
 * @example
 * ```tsx
 * const NameField = () => {
 *   const { value, error, isTouched, setValue, touch } = useFormField<string>('name');
 *
 *   return (
 *     <div>
 *       <input
 *         value={value}
 *         onChange={(e) => setValue(e.target.value)}
 *         onBlur={() => touch('name')}
 *       />
 *       {isTouched && error && <span className="error">{error}</span>}
 *     </div>
 *   );
 * };
 * ```
 *
 * @public
 */
const useFormField = <T>(fieldPath: string) => {
  const { error, form, isTouched, errors, touch, validate } =
    useFormHelper(fieldPath);

  const [value, setValue] = useState<T | undefined>();

  useEffect(() => {
    const unsubscribe = form?.subscribeOnChange<T>(setValue, fieldPath);

    return () => {
      unsubscribe?.();
    };
  }, [fieldPath, form]);

  const handleSetValue = useCallback(
    (newValue: T) => {
      form?.setValue(fieldPath, newValue);
    },
    [fieldPath, form],
  );

  return {
    value,
    error,
    errors,
    isTouched,
    validate,
    touch,
    setValue: handleSetValue,
  };
};

export default useFormField;
