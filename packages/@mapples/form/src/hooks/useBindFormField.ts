import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { first } from 'lodash';

import FormContext from '../context';

/**
 * Hook to bind a form field with optional fallback path synchronization.
 * This hook is similar to useFormField but allows binding a field to a fallback path,
 * useful for creating field aliases or synchronized fields.
 *
 * @template T - The type of the field value
 * @param fieldPath - Primary dot notation path to the field
 * @param fallBackPath - Optional fallback path to synchronize with
 * @param fallbackValue - Default value to use if field is undefined
 * @param subscribe - Whether to subscribe to real-time value changes (default: true)
 * @returns Object containing field value, error state, and control methods
 *
 * @example
 * ```tsx
 * const NameField = () => {
 *   const { value, error, setValue } = useBindFormField<string>(
 *     'user.name',
 *     'displayName', // Also update displayName when user.name changes
 *     ''
 *   );
 *
 *   return (
 *     <input
 *       value={value}
 *       onChange={(e) => setValue(e.target.value)}
 *     />
 *   );
 * };
 * ```
 *
 * @public
 */
const useBindFormField = <T>(
  fieldPath: string,
  fallBackPath?: string,
  fallbackValue?: T,
  subscribe?: boolean,
) => {
  const { form, touched, validationErrors, validate, touch } =
    useContext(FormContext);

  const [value, setValue] = useState<T | undefined>(fallbackValue);

  const errors = validationErrors?.[fieldPath];

  const error = useMemo(() => {
    return first(errors)?.message;
  }, [errors]);

  const isTouched = useMemo(() => {
    return !!touched[fieldPath as keyof typeof touched];
  }, [fieldPath, touched]);

  useEffect(() => {
    setValue(() => {
      const value = form?.getValue<T>(fieldPath) || fallbackValue;

      if (fallBackPath) {
        form?.setValue(fallBackPath, value);
      }
      return value;
    });
  }, [fallBackPath, fallbackValue, fieldPath, form]);

  useEffect(() => {
    if (!subscribe) {
      const unsubscribe = form?.subscribeOnHistoryChange(() => {
        const newValue = form?.getValue<T>(fieldPath) || fallbackValue;
        if (fallBackPath) {
          form?.setValue(fallBackPath, newValue);
        }
        setValue(newValue);
      });

      return () => {
        unsubscribe?.();
      };
    }

    const unsubscribe = form?.subscribeOnChange<T>(setValue, fieldPath);

    return () => {
      unsubscribe?.();
    };
  }, [fallBackPath, fallbackValue, fieldPath, form, subscribe]);

  const handleSetValue = useCallback(
    (newValue: T) => {
      form?.setValue(fieldPath, newValue);
      if (!subscribe) {
        setValue(newValue);
        if (fallBackPath) {
          form?.setValue(fallBackPath, newValue);
        }
      }
    },
    [fallBackPath, fieldPath, form, subscribe],
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
