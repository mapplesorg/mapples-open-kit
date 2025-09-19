import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { first } from 'lodash';

import FormContext from '../context';

/**
 * Hook to manage a single form field with value, validation, and touch state.
 * This hook provides reactive access to a form field's value, errors, and touch state,
 * along with methods to update the value and trigger validation.
 * 
 * @template T - The type of the field value
 * @param fieldPath - Dot notation path to the field (e.g., 'user.name')
 * @param fallbackValue - Default value to use if field is undefined
 * @param subscribe - Whether to subscribe to real-time value changes (default: true)
 * @returns Object containing field value, error state, and control methods
 * 
 * @example
 * ```tsx
 * const NameField = () => {
 *   const { value, error, isTouched, setValue, touch } = useFormField<string>('name', '');
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
const useFormField = <T>(
  fieldPath: string,
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
    setValue(form?.getValue<T>(fieldPath) || fallbackValue);
  }, [fallbackValue, fieldPath, form]);

  useEffect(() => {
    if (!subscribe) {
      const unsubscribe = form?.subscribeOnHistoryChange(() => {
        setValue(form?.getValue<T>(fieldPath) || fallbackValue);
      });

      return () => {
        unsubscribe?.();
      };
    }

    const unsubscribe = form?.subscribeOnChange<T>(setValue, fieldPath);

    return () => {
      unsubscribe?.();
    };
  }, [fallbackValue, fieldPath, form, subscribe]);

  const handleSetValue = useCallback(
    (newValue: T) => {
      form?.setValue(fieldPath, newValue);
      if (!subscribe) {
        setValue(newValue);
      }
    },
    [fieldPath, form, subscribe],
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
