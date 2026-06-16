import { useCallback, useEffect, useState } from 'react';

import useFormHelper from './useFormHelper';

/**
 * Hook to bind a form field with optional fallback path synchronization.
 * This hook is similar to useFormField but allows binding a field to a fallback path,
 * useful for creating field aliases or synchronized fields.
 *
 * @template T - The type of the field value
 * @param fieldPath - Primary dot notation path to the field
 * @param fallBackPath - Optional fallback path to synchronize with
 * @returns Object containing field value, error state, and control methods
 *
 * @example
 * ```tsx
 * const NameField = () => {
 *   const { value, error, setValue } = useBindFormField<string>(
 *     'user.name',
 *     'displayName', // Also writes to displayName whenever user.name changes
 *   );
 *
 *   return (
 *     <input
 *       value={value ?? ''}
 *       onChange={(e) => setValue(e.target.value)}
 *     />
 *   );
 * };
 * ```
 *
 * @public
 */
const useBindFormField = <T>(fieldPath: string, fallBackPath?: string) => {
  const { error, form, isTouched, errors, touch, validate } =
    useFormHelper(fieldPath);

  const [value, setValue] = useState<T | undefined>();

  useEffect(() => {
    const unsubscribe = form?.subscribeOnChange<T>((v) => {
      if (fallBackPath) {
        form?.setValue(fallBackPath, v);
      }
      setValue(v);
    }, fieldPath);

    return () => {
      unsubscribe?.();
    };
  }, [fallBackPath, fieldPath, form]);

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

export default useBindFormField;
